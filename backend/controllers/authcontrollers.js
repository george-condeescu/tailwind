import { User, OrgUnit, UserMembership } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../utils/database.js';
import pool from '../utils/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

import {
  userCreateSchema,
  userUpdateSchema,
} from '../validators/user.schema.js';
import { membershipCreateSchema } from '../validators/membership.schema.js';

import { myCache } from '../middleware/cacheMiddleware.js';
import logAuditEvent from '../services/auditService.js';

//getUserById - doar admin sau user-ul in cauza poate accesa endpoint-ul - get /api/auth/users/:id
const getUserById = async (req, res) => {
  const userId = req.params.id;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  //obtin departamentul utilizatorului
  const memberships = await user.getMemberships({
    order: [['createdAt', 'DESC']], // Selecteaza cel mai recent user_membership
  });
  if (memberships && memberships.length > 0) {
    const orgUnit = await memberships[0].getOrgUnit();
    user.dataValues.department = orgUnit ? orgUnit.name : null;
    user.dataValues.org_unit_id = orgUnit ? orgUnit.id : null;
  } else {
    user.dataValues.department = null;
    user.dataValues.org_unit_id = null;
  }
  const key = '__cache__' + req.originalUrl;
  myCache.set(key, user, 300); // Cache the user data for 5 minutes
  res.json(user);
};

//get all users - doar admin poate accesa endpoint-ul - get /api/auth/users
const getAllUsers = async (req, res) => {
  const response = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
  });

  const key = '__cache__' + req.originalUrl;
  const dataToCache = { users: response.rows, count: response.count };
  myCache.set(key, dataToCache, 300); // Cache the users data for 5 minutes
  res.json({ users: response.rows, count: response.count });
};

// Register a new user => POST /api/auth/register
const register = async (req, res) => {
  // console.log('body:',req.body);
  const userData = userCreateSchema.safeParse(req.body);

  if (!userData.success) {
    const errors = userData.error.issues.map((e) => ({
      field: e.path[0],
      message: e.message,
    }));

    return res.status(400).json({ errors });
  }

  const membershipData = membershipCreateSchema.safeParse(req.body);
  if (!membershipData.success) {
    const errors = membershipData.error.issues.map((e) => ({
      field: e.path[0],
      message: e.message,
    }));

    return res.status(400).json({ errors });
  }

  const { username, full_name, email, password, is_admin, is_active } = userData.data;
  const { start_date, end_date, org_unit_id } = membershipData.data;

  //verific daca user-ul exista deja (username si email existente)
  const existingUser = await User.findOne({
    where: { email, username },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, error: 'Email or username already in use' });
  }

  //verific daca org_unit_id exista in tabelul org_unit
  const existDepart = await OrgUnit.findOne({ where: { id: org_unit_id } });

  if (!existDepart) {
    return res.status(400).json({
      success: false,
      error: 'Organization ID not exists.',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await sequelize.transaction(async (t) => {
      // 1. Creez user-ul
      const newUser = await User.create(
        {
          username,
          full_name,
          email,
          password: hashedPassword,
          is_admin,
          is_active: is_active ?? 0,
        },
        { transaction: t },
      );

      //2. Creez membership-ul pentru user-ul creat
      const membership = await UserMembership.create(
        {
          user_id: newUser.id,
          org_unit_id: org_unit_id,
          start_date: start_date || Date.now(),
          end_date: end_date || null,
        },
        { transaction: t },
      );

      // 3. Curat cache-ul pentru lista de useri si pentru user-ul creat
      const keyAllUsers = '__cache__/api/auth/admin/users';
      const keyUser = `__cache__/api/auth/admin/users/${newUser.id}`;
      myCache.del(keyAllUsers); // Clear cache for all users
      myCache.del(keyUser); // Clear cache for the specific user

      // 4. Returnez user-ul creat si membership-ul creat
      return { newUser, membership };
    });
    // 5. Log audit pentru crearea user-ului
    await logAuditEvent(pool, {
      req,
      action: 'CREATE',
      entity_type: 'USER',
      entity_id: result.newUser.id,
      summary: `User nou creat cu ID: ${result.newUser.id}.`,
      after_data: result.newUser,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.newUser,
      membership: result.membership,
    });
  } catch (error) {
    //daca tranzactia esueaza, sequelize va face automat rollback la toate operatiunile din tranzactie
    console.error('ERR name:', error.name);
    console.error('ERR message:', error.message);
    console.error('ERR errors:', error.errors);
    console.error('ERR original:', error.original);
    res.status(500).json({ success: false, error: error.message });
  }
};
// Login a user
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    // LOGARE EȘEC (Important pentru securitate)
    await logAuditEvent(pool, {
      req,
      action: 'FAILED_LOGIN',
      entity_type: 'USER',
      entity_id: user ? user.id : null,
      summary: `Tentativă de login eșuată pentru email: ${email}. Invalid credentials.`,
      after_data: { email, attempt_at: new Date() },
    });
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // LOGARE EȘEC (Important pentru securitate)
    await logAuditEvent(pool, {
      req,
      action: 'FAILED_LOGIN',
      entity_type: 'USER',
      entity_id: user ? user.id : null,
      summary: `Tentativă de login eșuată pentru email: ${email}. Invalid credentials.`,
      after_data: { email, attempt_at: new Date() },
    });
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  if (!user.is_active) {
    // LOGARE EȘEC (Important pentru securitate)
    await logAuditEvent(pool, {
      req,
      action: 'FAILED_LOGIN',
      entity_type: 'USER',
      entity_id: user ? user.id : null,
      summary: `Tentativă de login eșuată pentru email: ${email}. Contul nu este activ.`,
      after_data: { email, attempt_at: new Date() },
    });
    return res.status(403).json({
      success: false,
      message: 'Contul tău nu este activat. Contactează administratorul.',
    });
  }
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 3600 },
  );
  //find user's org unit for audit log
  const memberships = await user.getMemberships({
    order: [['createdAt', 'DESC']], // Selecteaza cel mai recent user_membership
  });
  const orgUnitId =
    memberships && memberships.length > 0 ? memberships[0].org_unit_id : null;

  // LOGARE SUCCES
  await logAuditEvent(pool, {
    req,
    actor_user_id: user.id,
    actor_org_unit_id: orgUnitId,
    action: 'LOGIN',
    entity_type: 'USER',
    entity_id: user.id,
    summary: `Utilizatorul ${user.username} s-a autentificat cu succes.`,
  });

  req.session.token = token; // Store the token in the session

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      is_admin: user.is_admin,
      is_active: user.is_active,
    },
  });
};

//Logout user
const logout = async (req, res) => {
  // Invalidate the token on the client side by clearing it from storage
  req.session.token = null; // Clear the token from the session

  // LOGOUT SUCCES
  await logAuditEvent(pool, {
    req,
    actor_user_id: req.user ? req.user.id : null,
    actor_org_unit_id: req.user ? req.user.org_id : null,
    action: 'LOGOUT',
    entity_type: 'USER',
    entity_id: req.user ? req.user.id : null,
    summary: `Utilizatorul ${req.user ? req.user.username : 'Unknown'} s-a deconectat.`,
  });
  res.json({ message: 'User logged out successfully' });
};

//get user profile - doar admin sau user-ul in cauza poate accesa endpoint-ul - get /api/auth/admin/users/profile/:id
const getProfile = async (req, res) => {
  const userId = req.user.userId;
  console.log('Fetching profile for user ID:', userId);
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const memberships = await user.getMemberships({
    order: [['createdAt', 'DESC']], // Selecteaza cel mai recent user_membership
  });
  if (memberships && memberships.length > 0) {
    const orgUnit = await memberships[0].getOrgUnit();
    user.dataValues.department = orgUnit ? orgUnit.name : null;
    user.dataValues.org_unit_id = orgUnit ? orgUnit.id : null;
  } else {
    user.dataValues.department = null;
    user.dataValues.org_unit_id = null;
  }
  res.json(user);
};

//update user profile (admin sau user) - put /api/auth/profile sau /api/auth/admin/users/profile/:id
const updateProfile = async (req, res) => {
  const userId = req.params.id || req.user.userId;
  // const { username, full_name, email, is_admin, is_active, org_unit_id } = req.body;
  const userData = userUpdateSchema.partial().safeParse(req.body);
  // console.log('userData', userData);
  if (!userData.success) {
    const errors = userData.error.issues.map((e) => ({
      field: e.path[0],
      message: e.message,
    }));
    return res.status(400).json({ errors });
  }

  const membershipData = membershipCreateSchema.safeParse(req.body);
  // console.log('membershipData', membershipData);
  if (!membershipData.success) {
    const errors = membershipData.error.issues.map((e) => ({
      field: e.path[0],
      message: e.message,
    }));

    return res.status(400).json({ errors });
  }

  const { username, full_name, email, password, is_admin, is_active } =
    userData.data;
  const { start_date, end_date, org_unit_id } = membershipData.data;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  //verific daca org_unit_id exista in tabelul org_unit
  const existDepart = await OrgUnit.findByPk(org_unit_id);

  if (!existDepart) {
    return res.status(400).json({
      status: false,
      message: 'Organization ID not exists.',
    });
  }

  try {
    await User.sequelize.transaction(async (t) => {
      if (username) user.username = username;
      if (full_name) user.full_name = full_name;
      if (email) user.email = email;
      if (is_admin !== undefined) user.is_admin = Number(is_admin);
      if (is_active !== undefined) user.is_active = Number(is_active);

      await user.save({ transaction: t });

      if (org_unit_id) {
        const orgUnit = await OrgUnit.findByPk(org_unit_id);
        if (!orgUnit) {
          throw new Error('Organization unit not found');
        }

        const existingMembership = await user.getMemberships({
          where: { org_unit_id: org_unit_id },
        });

        if (existingMembership && existingMembership.length > 0) {
          await existingMembership[0].update(
            {
              end_date: null,
              start_date: new Date().toISOString().slice(0, 10),
            },
            { transaction: t },
          );
        } else {
          await user.createMembership(
            {
              start_date: start_date || new Date().toISOString().split('T')[0],
              end_date: end_date || null,
              org_unit_id,
            },
            { transaction: t },
          );
        }
      }
    });
    // Clear cache for all users and the specific user
    myCache.del('__cache__/api/auth/admin/users'); // Clear cache for all users
    myCache.del(`__cache__/api/auth/admin/users/${userId}`); // Clear cache for the specific user

    res.json({
      message: 'Profile updated successfully',
      user: await user.reload(),
      memberships: await user.getMemberships(),
    });
  } catch (error) {
    console.error('ERR name:', error.name);
    console.error('ERR message:', error.message);
    console.error('ERR errors:', error.errors);
    console.error('ERR original:', error.original);
    res
      .status(500)
      .json({ message: 'Error updating profile', error: error.message });
  }
};

// delete user - doar admin - delete /api/auth/admin/users/:id
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  await user.destroy();
  myCache.del('__cache__/api/auth/admin/users'); // Clear cache for all users
  myCache.del(`__cache__/api/auth/admin/users/${userId}`); // Clear cache for the specific user
  res.json({ message: 'User deleted successfully' });
};

//forgot password - send email with reset link - post /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Aici ar trebui să adaugi logica pentru a trimite emailul cu linkul de resetare a parolei
  //reset token
  const resetToken = bcrypt.hashSync(email, 10, function (err, hash) {
    if (err) {
      console.error('Error generating reset token:', err);
      return null;
    }
    return hash;
  });
  //set reset token in database for user
  user.resetPasswordToken = resetToken;
  //set token expiration time to 30 minutes
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; //30 minutes expiration time
  await user.save();

  await user.reload();
  const resetUrl = `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`;
  const message = `Hello ${user.full_name},\n\nDvs. ati solicitat resetarea parolei. Vă rugăm să faceți clic pe linkul de mai jos pentru a vă reseta parola:\n\n${resetUrl}\n\nDacă nu ați solicitat acest lucru, vă rugăm să ignorați acest email.\n\nCu stimă,\nAdmin\nCJ Teleorman.`;

  try {
    // Aici ar trebui să adaugi logica pentru a trimite emailul folosind un serviciu de email (ex: nodemailer)
    await sendEmail({
      email,
      subject: 'Password Reset Request',
      message,
    });

    res.status(200).json({
      message: 'Email sent to: ' + email,
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    await user.reload();
    res.status(500).json({ message: 'Error sending reset email' });
  }
};

//reset password - post /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const token = req.body.token;
  const resetPasswordExpire = req.body.resetPasswordExpire;

  const allUsers = await User.findAll({
    attributes: ['id', 'email', 'resetPasswordToken', 'resetPasswordExpire'],
  });

  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpire: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: 'Password does not match' });
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();
  res.status(200).json({ message: 'Password reset successful' });
};

export {
  register,
  login,
  logout,
  getProfile,
  getAllUsers,
  getUserById,
  updateProfile,
  deleteUser,
  forgotPassword,
  resetPassword,
};

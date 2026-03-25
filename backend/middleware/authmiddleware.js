import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Verifica daca utilizatorul este autentificat (token JWT valid)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acces interzis. Nu ești autentificat.',
      redirectTo: '/login',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid sau expirat. Te rugăm să te autentifici din nou.',
        redirectTo: '/login?reason=expired',
      });
    }

    req.user = decoded; // { userId, role, iat, exp }
    next();
  });
};

// Verifica daca utilizatorul autentificat are drepturi de admin
const requireAdmin = async (req, res, next) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Acces interzis. Nu ești autentificat.',
      redirectTo: '/login',
    });
  }

  const user = await User.findByPk(userId, {
    attributes: ['id', 'is_admin', 'is_active'],
  });

  if (!user || !user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'Contul tău este inactiv sau nu există.',
      redirectTo: '/login',
    });
  }

  if (!user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Nu ai dreptul de a accesa această pagină. Este necesară autorizarea de administrator.',
    });
  }

  next();
};

export { authenticateToken, requireAdmin };

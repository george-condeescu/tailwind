import { OrgUnit, User } from '../models/index.js';
import { orgunitSchema } from '../validators/orgunit.schema.js';

import sequelize from '../utils/database.js';
import pool from '../utils/db.js';
import { myCache } from '../middleware/cacheMiddleware.js';

// Create a new organization unit ==> POST /api/orgunits
const createOrgUnit = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const orgunitData = orgunitSchema.safeParse(req.body);

    if (!orgunitData.success) {
      // validare eșuată
      const errors = orgunitData.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));

      return res.status(400).json({ errors });
    }

    const { name, type, parent_id, code, is_active } = orgunitData.data;

    // validare suplimentară: nume unic în toată organigrama
    const existingOrgUnit = await OrgUnit.findOne({ where: { name } });

    if (existingOrgUnit) {
      return res.status(400).json({
        success: false,
        message: `Departamentul '${name}' există deja.`,
      });
    }

    // validare suplimentară: dacă parent_id e specificat, să existe și să fie activ
    if (parent_id) {
      const parentOrgUnit = await OrgUnit.findByPk(parent_id);
      if (!parentOrgUnit) {
        return res.status(400).json({
          success: false,
          message: 'Părintele specificat nu există.',
        });
      }
      if (!parentOrgUnit.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Părintele specificat este inactiv.',
        });
      }
    }

    const orgUnit = await OrgUnit.create({
      name,
      type,
      parent_id,
      code,
      is_active,
    });

    myCache.del(key); // Invalidate cache for the list of organization units
    res.status(201).json({
      message: 'Departament created successfully',
      data: orgUnit,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating department',
      error: error.message,
    });
  }
};

// Get all organization units ==> GET /api/orgunits
const findAllOrgUnit = async (req, res) => {
  const key = '__cache__' + req.originalUrl;

  try {
    const orgUnits = await OrgUnit.findAll();
    myCache.set(key, orgUnits, 300);

    res.status(200).json({
      message: 'Organization units retrieved successfully',
      data: orgUnits,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving organization units',
      error: error.message,
    });
  }
};

// Get department by User ID => GET /departments/user/:userId
const findDepartmentByUserId = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const membership = await user.getMemberships({
      limit: 1,
      order: [['createdAt', 'DESC']],
    });
    if (!membership || membership.length === 0) {
      return res.status(404).json({
        message: 'Membership not found for the given user ID',
      });
    }
    const lastMembership = membership.length > 0 ? membership[0] : null;
    if (lastMembership) {
      const cleanData = lastMembership.get({ plain: true });
      // Sau direct:
      const orgUnitId = lastMembership.org_unit_id;

      const department = await OrgUnit.findOne({
        where: { id: orgUnitId },
      });
      if (!department) {
        return res.status(404).json({
          message: 'Department not found for the given user ID',
        });
      }

      myCache.set(key, department, 300);

      res.status(200).json({
        message: 'Department retrieved successfully',
        data: department,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving department',
      error: error.message,
    });
  }
};

// Get user's direction (DIRECTIE) by user ID => GET /orgunits/user/:userId/directie
async function getUserDirectie(req, res) {
  try {
    const key = '__cache__' + req.originalUrl;

    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'userId invalid' });
    }

    const sql = `
      WITH RECURSIVE ou_path AS (
        SELECT ou.id, ou.name, ou.parent_id, ou.type, ou.code, ou.is_active
        FROM user_membership um
        JOIN org_units ou ON ou.id = um.org_unit_id
        WHERE um.user_id = ?

        UNION ALL

        SELECT p.id, p.name, p.parent_id, p.type, p.code, p.is_active
        FROM org_units p
        JOIN ou_path c ON c.parent_id = p.id
      )
      SELECT id, name, parent_id, type, code, is_active
      FROM ou_path
      WHERE type = 'DIRECTIE'
      LIMIT 1;
    `;

    const [rows] = await pool.query(sql, [userId]);

    if (!rows.length) {
      return res
        .status(404)
        .json({ error: 'Nu am găsit direcția pentru acest user' });
    }

    myCache.set(key, rows[0], 300);

    res.status(200).json({
      message: 'Direcția retrieved successfully',
      data: rows[0],
    });
  } catch (err) {
    console.error('getUserDirectie error:', err);
    res.status(500).json({ error: 'Eroare internă' });
  }
}

// Get organization unit by ID => GET /api/orgunits/:id
const findOrgUnitById = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;

    const { id } = req.params;

    const orgUnit = await OrgUnit.findByPk(id);

    if (!orgUnit) {
      return res.status(404).json({
        message: 'Organization unit not found',
      });
    }

    myCache.set(key, orgUnit, 300);

    res.status(200).json({
      message: 'Organization unit retrieved successfully',
      data: orgUnit,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving organization unit',
      error: error.message,
    });
  }
};

// Update organization unit => PUT /api/orgunits/:id
const updateOrgUnit = async (req, res) => {
  try {
    const orgunitData = orgunitSchema.safeParse(req.body);

    if (!orgunitData.success) {
      const errors = orgunitData.error.issues.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));

      return res.status(400).json({ errors });
    }

    const { id } = req.params;
    const { name, type, parent_id, code, is_active } = orgunitData.data;

    const orgUnit = await OrgUnit.findByPk(id);

    if (!orgUnit) {
      return res.status(404).json({
        message: 'Organization unit not found',
      });
    }

    await orgUnit.update({
      name: name || orgUnit.name,
      type: type || orgUnit.type,
      parent_id: parent_id ?? orgUnit.parent_id,
      code: code || orgUnit.code,
      is_active: is_active ?? orgUnit.is_active,
    });

    myCache
      .keys()
      .filter((k) => k.startsWith('__cache__/api/departments'))
      .forEach((k) => myCache.del(k));

    res.status(200).json({
      message: 'Organization unit updated successfully',
      data: orgUnit,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating organization unit',
      error: error.message,
    });
  }
};

// Delete organization unit => DELETE /api/orgunits/:id
const deleteOrgUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const orgUnit = await OrgUnit.findByPk(id);

    if (!orgUnit) {
      return res.status(404).json({
        message: 'Organization unit not found',
      });
    }

    await orgUnit.destroy();

    myCache.del('__cache__' + req.originalUrl);
    const listKey = '__cache__/api/departments';
    myCache.del(listKey); // Invalidate cache for the list of organization units

    res.status(200).json({
      message: 'Organization unit deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting organization unit',
      error: error.message,
    });
  }
};

//set inactive organization unit => PUT /api/orgunits/:id/inactive
const setInactiveOrgUnit = async (req, res) => {
  const { id } = req.params;

  const orgUnit = await OrgUnit.findByPk(id);

  if (!orgUnit) {
    return res.status(404).json({
      message: 'Organization unit not found',
    });
  }
  try {
    await orgUnit.update({
      is_active: 0,
    });

    myCache.del('__cache__' + req.originalUrl);
    const listKey = '__cache__/api/orgunits';
    myCache.del(listKey); // Invalidate cache for the list of organization units

    res.status(200).json({
      message: 'Organization unit is inactive now',
      data: orgUnit,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating organization unit',
      error: error.message,
    });
  }
};

/**
 * GET /subordonati/:id
 * Returneaza subordonatii directi ai unui departament
 * - id = id-ul departamentului pentru care vrem subordonatii
 */
const getSubordonati = async (req, res) => {
  const { id } = req.params;
  // validare id
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID invalid.',
    });
  }
  const key = '__cache__' + req.originalUrl;

  // verificăm dacă departamentul există și e activ
  const parent = await OrgUnit.findByPk(id);
  if (!parent || !parent.is_active) {
    return res.status(400).json({
      success: false,
      message: 'Department not found or is inactive.',
    });
  }
  try {
    const subordinates = await OrgUnit.findAll({
      where: { parent_id: id },
    });

    if (subordinates) {
      res.status(200).json({
        message: 'Subordinates retrieved successfully.',
        data: subordinates,
      });
      myCache.set(key, subordinates, 300);
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving subordinates.',
      error: error.message,
    });
  }
};

/**
 * GET /:id/subtree
 * Returnează subordinea unei direcții (id) ca arbore:
 * - root = direcția
 * - children = servicii/compartimente etc.
 */
const getDirectionSubtree = async (req, res) => {
  // show;
  try {
    const directionId = Number(req.params.id);
    if (!Number.isInteger(directionId) || directionId <= 0) {
      return res.status(400).json({ message: 'id invalid' });
    }

    const key = '__cache__' + req.originalUrl;

    // 1) Luăm toată subordinea într-un singur result set
    // Observație: "depth" e util pentru debug/ordonare
    const rows = await sequelize.query(
      `
      WITH RECURSIVE tree AS (
        SELECT 
          ou.id,
          ou.name,
          ou.type,
          ou.parent_id,
          ou.code,
          ou.is_active,
          0 AS depth
        FROM org_units ou
        WHERE ou.id = :directionId

        UNION ALL

        SELECT
          child.id,
          child.name,
          child.type,
          child.parent_id,
          child.code,
          child.is_active,
          t.depth + 1 AS depth
        FROM org_units child
        JOIN tree t ON child.parent_id = t.id
      )
      SELECT * 
      FROM tree
      ORDER BY depth, parent_id, id;
      `,
      {
        replacements: { directionId },
        // Sequelize v6: tipul query-ului:
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Direcția nu există' });
    }

    // 2) Construim arborele (groupare după parent_id)
    // map id -> node
    const byId = new Map();
    for (const r of rows) {
      byId.set(r.id, {
        id: r.id,
        name: r.name,
        type: r.type,
        parent_id: r.parent_id,
        code: r.code,
        is_active: !!r.is_active,
        children: [],
      });
    }

    // root = directionId
    const root = byId.get(directionId);
    if (!root) {
      // teoretic nu se întâmplă dacă query-ul a returnat rânduri
      return res.status(404).json({ message: 'Direcția nu există' });
    }

    // atașăm copiii la părinți
    for (const node of byId.values()) {
      if (node.parent_id == null) continue;
      const parent = byId.get(node.parent_id);
      if (parent) parent.children.push(node);
    }

    // (opțional) sortare copii: Direcție -> Serviciu -> Compartiment, apoi alfabetic
    const typeOrder = { DIRECTIE: 0, SERVICIU: 1, COMPARTIMENT: 2 };
    const sortTree = (n) => {
      n.children.sort((a, b) => {
        const ta = typeOrder[a.type] ?? 99;
        const tb = typeOrder[b.type] ?? 99;
        if (ta !== tb) return ta - tb;
        return a.name.localeCompare(b.name, 'ro');
      });
      n.children.forEach(sortTree);
    };
    sortTree(root);

    // Cache the result
    myCache.set(key, root, 300);

    // Returnezi doar arborele
    return res.json({
      message: 'Subtree retrieved successfully.',
      data: root,
    });
  } catch (err) {
    console.error('getDirectionSubtree error:', err);
    return res.status(500).json({
      message: 'Eroare server',
      // util în dev:
      error: err?.original?.sqlMessage || err.message,
    });
  }
};

//numar de departamente => GET /api/orgunits/count
const getDepartmentCount = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const cachedBody = myCache.get(key);

    if (cachedBody) {
      return res.status(200).json({
        message: 'Department count retrieved successfully',
        data: cachedBody,
      });
    }

    const count = await OrgUnit.findAndCountAll();

    myCache.set(key, count, 300);

    res.status(200).json({
      message: 'Department count retrieved successfully',
      data: count,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error retrieving department count',
      error: error.message,
    });
  }
};

export {
  createOrgUnit,
  updateOrgUnit,
  deleteOrgUnit,
  findAllOrgUnit,
  findOrgUnitById,
  getUserDirectie,
  setInactiveOrgUnit,
  getSubordonati,
  getDirectionSubtree,
  getDepartmentCount,
  findDepartmentByUserId,
};

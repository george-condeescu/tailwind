import express from 'express';
import sequelize from '../utils/database.js';

const auditRouter = express.Router();

// GET /api/admin/audit-events?limit=50&page=1
auditRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const offset = (page - 1) * limit;

  try {
    const [rows] = await sequelize.query(
      `SELECT ae.id, ae.action, ae.entity_type, ae.entity_id, ae.summary,
              ae.ip_address, ae.created_at,
              u.full_name AS actor_name, u.email AS actor_email
       FROM audit_events ae
       LEFT JOIN users u ON u.id = ae.actor_user_id
       ORDER BY ae.created_at DESC
       LIMIT :limit OFFSET :offset`,
      { replacements: { limit, offset } },
    );

    const [[{ total }]] = await sequelize.query(
      'SELECT COUNT(*) AS total FROM audit_events',
    );

    res.json({ events: rows, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default auditRouter;

const logger = require('./logger'); // Winston
const { logAuditEvent } = require('./services/auditService');

// Middleware-ul de eroare are obligatoriu 4 parametri: (err, req, res, next)
app.use(async (err, req, res, next) => {
  const correlationId = req.correlationId || 'N/A';

  // 1. Logăm detaliile tehnice în Winston (pe disc)
  logger.error(`[GLOBAL_ERROR] ${err.message}`, {
    correlationId,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 2. Logăm incidentul în tabelul de Audit (în DB)
  // Astfel, adminii vor vedea că o acțiune a eșuat din motive tehnice
  try {
    await logAuditEvent(req.app.get('dbPool'), {
      req,
      action: 'UPDATE', // Sau o valoare generică dacă nu știm contextul
      entity_type: 'USER',
      summary: `EROARE CRITICĂ SISTEM: ${err.message}`,
      after_data: { error_name: err.name, path: req.path },
    });
  } catch (auditErr) {
    logger.error('Nu s-a putut scrie în Audit DB:', auditErr);
  }

  // 3. Trimitem un răspuns curat către client (fără detalii tehnice sensibile)
  res.status(err.status || 500).json({
    success: false,
    message: 'A apărut o eroare internă. Te rugăm să contactezi suportul.',
    correlationId: correlationId, // Îi dăm ID-ul ca să ni-l poată comunica
  });
});

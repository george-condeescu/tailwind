/**
 * Helper pentru salvarea evenimentelor de audit în interiorul unei tranzacții.
 * @param {Object} connection - Conexiunea de MySQL (poate fi un pool sau o tranzacție activă)
 * @param {Object} data - Datele evenimentului conform structurii tabelului
 */
const logAuditEvent = async (
  connection,
  {
    req, // Obiectul req pentru IP, User Agent și Correlation ID
    actor_user_id, // ID-ul utilizatorului care face acțiunea
    actor_org_unit_id, // ID-ul unității organizaționale
    action, // 'CREATE', 'UPDATE', etc.
    entity_type, // 'DOCUMENT', 'USER', etc.
    entity_id, // ID-ul resursei afectate
    summary, // Descriere scurtă
    before_data = null, // JSON cu starea veche
    after_data = null, // JSON cu starea nouă
  },
) => {
  const query = `
        INSERT INTO audit_events 
        (actor_user_id, actor_org_unit_id, action, entity_type, entity_id, 
         summary, before_data, after_data, ip_address, user_agent) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    actor_user_id ?? (req.user ? req.user.userId : null),
    actor_org_unit_id ?? null,
    action,
    entity_type,
    entity_id,
    summary,
    before_data ? JSON.stringify(before_data) : null,
    after_data ? JSON.stringify(after_data) : null,
    (
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    ).replace(/^::ffff:/, ''),
    req.get('User-Agent') || 'Unknown',
    // req.correlationId || null, // Generat de middleware-ul anterior
  ];

  await connection.execute(query, values);
};

export default logAuditEvent;

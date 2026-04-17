import sequelize from '../utils/database.js';
import ticketService from '../services/ticketService.js';
import { myCache } from '../middleware/cacheMiddleware.js';
import logAuditEvent from '../services/auditService.js';

// Helper: audit în afara unei tranzacții
const auditWithNewConn = async (req, data) => {
  const conn = await sequelize.connectionManager.getConnection({ type: 'write' });
  try {
    await logAuditEvent(conn, { req, ...data });
  } finally {
    sequelize.connectionManager.releaseConnection(conn);
  }
};

const createTicket = async (req, res) => {
  try {
    const fisiere = (req.files || []).map((f) => ({
      filename: f.filename,
      originalname: f.originalname,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size,
    }));
    const result = await sequelize.transaction(async (t) => {
      const newTicket = await ticketService.createTicket(
        { ...req.body, fisiere },
        t,
      );
      await logAuditEvent(t.connection, {
        req,
        action: 'CREATE',
        entity_type: 'TICKET',
        entity_id: newTicket.id,
        summary: `Ticket nou creat cu ID: ${newTicket.id}.`,
        after_data: newTicket,
      });
      return newTicket;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating ticket:', error);
    await auditWithNewConn(req, {
      action: 'CREATE_ERROR',
      entity_type: 'TICKET',
      entity_id: null,
      summary: `Eroare la crearea ticketului: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const before = await ticketService.findTicketById(id);
    const result = await sequelize.transaction(async (t) => {
      const updatedTicket = await ticketService.updateTicket(id, req.body, t);
      myCache.del(`__cache__/api/tickets/${id}`);
      await logAuditEvent(t.connection, {
        req,
        action: 'UPDATE',
        entity_type: 'TICKET',
        entity_id: id,
        summary: `Ticketul cu ID: ${id} actualizat.`,
        before_data: before,
        after_data: updatedTicket,
      });
      return updatedTicket;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating ticket:', error);
    await auditWithNewConn(req, {
      action: 'UPDATE_ERROR',
      entity_type: 'TICKET',
      entity_id: id,
      summary: `Eroare la actualizarea ticketului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const before = await ticketService.findTicketById(id);
    await sequelize.transaction(async (t) => {
      await ticketService.deleteTicket(id, t);
      myCache.del(`__cache__/api/tickets/${id}`);
      await logAuditEvent(t.connection, {
        req,
        action: 'DELETE',
        entity_type: 'TICKET',
        entity_id: id,
        summary: `Ticketul cu ID: ${id} șters.`,
        before_data: before,
      });
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket:', error);
    await auditWithNewConn(req, {
      action: 'DELETE_ERROR',
      entity_type: 'TICKET',
      entity_id: id,
      summary: `Eroare la ștergerea ticketului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const findAllTicket = async (req, res) => {
  try {
    const tickets = await ticketService.findAllTicket();
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'TICKET',
      entity_id: null,
      summary: `Listare toate ticketele (${tickets.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'TICKET',
      entity_id: null,
      summary: `Eroare la listarea ticketelor: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const findTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketService.findTicketById(id);
    if (!ticket) {
      await auditWithNewConn(req, {
        action: 'READ_NOT_FOUND',
        entity_type: 'TICKET',
        entity_id: id,
        summary: `Ticketul cu ID: ${id} nu a fost găsit.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(404).json({ error: 'Ticket not found' });
    }
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'TICKET',
      entity_id: id,
      summary: `Ticketul cu ID: ${id} accesat.`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'TICKET',
      entity_id: id,
      summary: `Eroare la accesarea ticketului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const findTicketsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const tickets = await ticketService.findTicketsByUser(userId);
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'TICKET',
      entity_id: userId,
      summary: `Ticketele utilizatorului cu ID: ${userId} accesate (${tickets.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'TICKET',
      entity_id: userId,
      summary: `Eroare la accesarea ticketelor utilizatorului cu ID: ${userId}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const sendMesaj = async (req, res) => {
  const { id } = req.params;
  const { admin_mesaj } = req.body;
  if (!admin_mesaj?.trim()) {
    await auditWithNewConn(req, {
      action: 'UPDATE_DENIED',
      entity_type: 'TICKET',
      entity_id: id,
      summary: `Trimitere mesaj refuzată pentru ticketul cu ID: ${id}: mesajul este gol.`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(400).json({ error: 'Mesajul nu poate fi gol.' });
  }
  try {
    const before = await ticketService.findTicketById(id);
    const result = await sequelize.transaction(async (t) => {
      const updated = await ticketService.updateTicket(id, { admin_mesaj }, t);
      myCache.del(`__cache__/api/tickets/${id}`);
      await logAuditEvent(t.connection, {
        req,
        action: 'SEND_MESAJ',
        entity_type: 'TICKET',
        entity_id: id,
        summary: `Mesaj admin trimis pentru ticketul cu ID: ${id}.`,
        before_data: before,
        after_data: updated,
      });
      return updated;
    });
    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    await auditWithNewConn(req, {
      action: 'SEND_MESAJ_ERROR',
      entity_type: 'TICKET',
      entity_id: id,
      summary: `Eroare la trimiterea mesajului pentru ticketul cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

export default {
  createTicket,
  updateTicket,
  deleteTicket,
  findAllTicket,
  findTicketById,
  findTicketsByUser,
  sendMesaj,
};

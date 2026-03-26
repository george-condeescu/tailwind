import sequelize from '../utils/database.js';
import ticketService from '../services/ticketService.js';
import { myCache } from '../middleware/cacheMiddleware.js';

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
      return newTicket;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sequelize.transaction(async (t) => {
      const updatedTicket = await ticketService.updateTicket(id, req.body, t);
      myCache.del(`__cache__/api/tickets/${id}`);
      return updatedTicket;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    await sequelize.transaction(async (t) => {
      await ticketService.deleteTicket(id, t);
      myCache.del(`__cache__/api/tickets/${id}`);
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

const findAllTicket = async (_req, res) => {
  try {
    const tickets = await ticketService.findAllTicket();
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: error.message });
  }
};

const findTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketService.findTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

const findTicketsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const tickets = await ticketService.findTicketsByUser(userId);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: error.message });
  }
};

const sendMesaj = async (req, res) => {
  const { id } = req.params;
  const { admin_mesaj } = req.body;
  if (!admin_mesaj?.trim()) {
    return res.status(400).json({ error: 'Mesajul nu poate fi gol.' });
  }
  try {
    const result = await sequelize.transaction(async (t) => {
      const updated = await ticketService.updateTicket(id, { admin_mesaj }, t);
      myCache.del(`__cache__/api/tickets/${id}`);
      return updated;
    });
    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
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

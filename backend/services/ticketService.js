import Ticket from '../models/ticket.js';

const createTicket = async (ticketData, transaction) => {
  const newTicket = await Ticket.create(ticketData, { transaction });
  return newTicket;
};

const updateTicket = async (id, ticketData, transaction) => {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  await ticket.update(ticketData, { transaction });
  return ticket;
};

const deleteTicket = async (id, transaction) => {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  await ticket.destroy({ transaction });
};

const findAllTicket = async () => {
  return await Ticket.findAll();
};

const findTicketById = async (id) => {
  return await Ticket.findByPk(id);
};

const findTicketsByUser = async (userId) => {
  return await Ticket.findAll({ where: { user_id: userId }, order: [['createdAt', 'DESC']] });
};

export default {
  createTicket,
  updateTicket,
  deleteTicket,
  findAllTicket,
  findTicketById,
  findTicketsByUser,
};

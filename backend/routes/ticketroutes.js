import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import ticketController from '../controllers/ticketcontrollers.js';

const { createTicket, updateTicket, deleteTicket, findAllTicket, findTicketById, findTicketsByUser, sendMesaj } = ticketController;

const uploadDir = 'uploads/tickets';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Doar fișiere imagine sunt acceptate.'));
  },
});

const TicketRouter = express.Router();

TicketRouter.post('/', upload.array('fisiere', 5), createTicket);
TicketRouter.put('/:id/mesaj', sendMesaj);
TicketRouter.put('/:id', updateTicket);
TicketRouter.delete('/:id', deleteTicket);
TicketRouter.get('/:id', cacheMiddleware(300), findTicketById);
TicketRouter.get('/user/:userId', findTicketsByUser);
TicketRouter.get('/', cacheMiddleware(300), findAllTicket);

export default TicketRouter;

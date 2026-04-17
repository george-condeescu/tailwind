import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';

import logger from './utils/logger.js'; // Winston
import logAuditEvent from './services/auditService.js';

import { fileURLToPath } from 'url';

// Importăm node-cache pentru gestionarea cache-ului
import NodeCache from 'node-cache';
const myCache = new NodeCache();

//routes
import authRoutes from './routes/authroutes.js';
import orgunitRouter from './routes/orgunitroutes.js';
import { findAllOrgUnit } from './controllers/orgunitcontroller.js';
import partnerRouter from './routes/partnerroutes.js';
import nrinregRouter from './routes/nrinregroutes.js';
import registruRoutes from './routes/registruroutes.js';
import circulatieRoutes from './routes/circulatieroutes.js';
import documentRoutes from './routes/documentroutes.js';
import comentariuRoutes from './routes/comentariuroutes.js';
import fisierRoutes from './routes/fisierroutes.js';
// import registruRoutes from './routes/registruroutes.js';

import registruWorkflowRoutes from './routes/registruWorkflow.routes.js';
import TicketRouter from './routes/ticketroutes.js';
import auditRouter from './routes/auditroutes.js';
import contactRouter from './routes/contactroutes.js';
import {
  authenticateToken,
  requireAdmin,
} from './middleware/authmiddleware.js';

// Recreăm __filename și __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       "default-src": ["'self'"],
//       "connect-src": ["'self'", "http://localhost:5000", "http://localhost:5173"],
//       "img-src": ["'self'", "data:", "http://localhost:5000"], // Permite imagini/iconițe de pe backend
//       "script-src": ["'self'", "'unsafe-inline'"],
//       "style-src": ["'self'", "'unsafe-inline'"],
//     },
//   },
// }));

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Activează CORS pentru a permite cereri de la React
app.use(
  cors({
    origin: 'http://localhost:5173', // Permite doar aplicației tale React
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  }),
);

// sample route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});
app.use('/api/auth/profile', authenticateToken);
app.use('/api/auth/admin', authenticateToken, requireAdmin);
app.use('/api/auth', authRoutes);
app.get('/api/departments/public', findAllOrgUnit);
app.use('/api/departments', authenticateToken, orgunitRouter);
app.use('/api/partners', authenticateToken, partnerRouter);
app.use('/api/nrinreg', authenticateToken, nrinregRouter);
app.use('/api/registru', authenticateToken, registruRoutes);
app.use('/api/document-complet', authenticateToken, registruWorkflowRoutes);
app.use('/api/circulatie', authenticateToken, circulatieRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/comentarii', authenticateToken, comentariuRoutes);
app.use('/api/fisiere', authenticateToken, fisierRoutes);
app.use('/api/tickets', TicketRouter);
app.use('/api/admin/audit-events', authenticateToken, requireAdmin, auditRouter);
app.use('/api/contact', contactRouter);

// folder pentru fisiere statice (PDF-uri)
app.use('/api/uploads', express.static('uploads'));
// Orice cerere catre /pdfuri va cauta in folderul extern ../uploads
app.use('/pdfuri', express.static(path.join(__dirname, 'uploads')));

// Ruta pentru golirea cache-ului
app.post('/api/admin/flush-cache', (req, res) => {
  try {
    myCache.flushAll();
    res.status(200).json({ message: 'Cache-ul a fost golit cu succes!' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la golirea cache-ului' });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

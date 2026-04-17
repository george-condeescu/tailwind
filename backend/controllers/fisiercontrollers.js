import fs from 'fs';
import path from 'path';
import sequelize from '../utils/database.js';
import fisierService from '../services/fisierService.js';
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

const uploadFisier = async (req, res) => {
  const { document_id, uploaded_by_user_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const result = await fisierService.processFileUpload(
      req.file,
      document_id,
      uploaded_by_user_id,
    );
    const statusCode = result.isDuplicate ? 200 : 201;
    const key = '__cache__/api/fisiere/' + document_id;
    myCache.del(key);
    await auditWithNewConn(req, {
      action: 'CREATE',
      entity_type: 'FISIER',
      entity_id: result.id ?? null,
      summary: `Fișier încărcat pentru documentul ${document_id}: ${req.file.originalname}.`,
      after_data: result,
    }).catch((e) => console.error('Audit error:', e));
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error uploading fisier:', error);
    await auditWithNewConn(req, {
      action: 'CREATE_ERROR',
      entity_type: 'FISIER',
      entity_id: null,
      summary: `Eroare la încărcarea fișierului pentru documentul ${document_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const uploadMultipleFiles = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    // Trimitem array-ul de fișiere către service
    const results = await fisierService.processMultipleUploads(req.files);
    await auditWithNewConn(req, {
      action: 'CREATE',
      entity_type: 'FISIER',
      entity_id: null,
      summary: `Încărcare multiplă: ${req.files.length} fișiere procesate.`,
      after_data: results,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    await auditWithNewConn(req, {
      action: 'CREATE_ERROR',
      entity_type: 'FISIER',
      entity_id: null,
      summary: `Eroare la încărcarea multiplă a fișierelor: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    return res
      .status(500)
      .json({ message: 'Multi-upload failed', error: error.message });
  }
};

const getAllFiles = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  try {
    const fisiere = await fisierService.getAllFiles();
    myCache.set(key, fisiere, 300); // Cachează pentru 5 minute
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'FISIER',
      entity_id: null,
      summary: `Listare toate fișierele (${fisiere.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(fisiere);
  } catch (error) {
    console.error('Error fetching all fisiere:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'FISIER',
      entity_id: null,
      summary: `Eroare la listarea fișierelor: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const getFisiereByDocumentId = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  console.log('Cache key for this get request:', key);
  try {
    const fisiere = await fisierService.findFisiereByDocumentId(
      req.params.documentId,
    );
    if (fisiere.length > 0) {
      myCache.set(key, fisiere, 300); // Cachează doar dacă există fișiere
    }
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'FISIER',
      entity_id: req.params.documentId,
      summary: `Fișiere pentru documentul cu ID: ${req.params.documentId} accesate (${fisiere.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(fisiere);
  } catch (error) {
    console.error('Error fetching fisiere:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'FISIER',
      entity_id: req.params.documentId,
      summary: `Eroare la accesarea fișierelor pentru documentul cu ID: ${req.params.documentId}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const deleteFisierById = async (req, res) => {
  const { id } = req.params;

  try {
    const before = await fisierService.findFisierById(id);
    const result = await sequelize.transaction(async (t) => {
      const deleted = await fisierService.deleteFisierById(id, t);
      await logAuditEvent(t.connection, {
        req,
        action: 'DELETE',
        entity_type: 'FISIER',
        entity_id: id,
        summary: `Fișierul cu ID: ${id} șters.`,
        before_data: before,
      });
      return deleted;
    });
    if (result) {
      const key = '__cache__/api/fisiere/' + result;
      myCache.del(key);
      res.json({ message: 'Fisier deleted successfully' });
    } else {
      res.status(404).json({ error: 'Fisier not found' });
    }
  } catch (error) {
    console.error('Error deleting fisier:', error);
    await auditWithNewConn(req, {
      action: 'DELETE_ERROR',
      entity_type: 'FISIER',
      entity_id: id,
      summary: `Eroare la ștergerea fișierului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const downloadFisier = async (req, res) => {
  const { id } = req.params;
  try {
    const fisier = await fisierService.findFisierById(id);
    if (!fisier) {
      await auditWithNewConn(req, {
        action: 'READ_NOT_FOUND',
        entity_type: 'FISIER',
        entity_id: id,
        summary: `Fișierul cu ID: ${id} nu a fost găsit la descărcare.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(404).json({ error: 'Fisier negăsit' });
    }
    const absolutePath = path.resolve(fisier.file_path);
    if (!fs.existsSync(absolutePath)) {
      await auditWithNewConn(req, {
        action: 'READ_NOT_FOUND',
        entity_type: 'FISIER',
        entity_id: id,
        summary: `Fișierul cu ID: ${id} nu există pe disc (${fisier.file_path}).`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(404).json({ error: 'Fișierul nu există pe disc' });
    }
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'FISIER',
      entity_id: id,
      summary: `Fișierul cu ID: ${id} (${fisier.original_name}) descărcat.`,
    }).catch((e) => console.error('Audit error:', e));
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fisier.original_name)}"`);
    res.setHeader('Content-Type', fisier.mime_type || 'application/octet-stream');
    const stream = fs.createReadStream(absolutePath);
    stream.on('error', (streamErr) => {
      console.error('Stream error:', streamErr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Eroare la citirea fișierului' });
      }
    });
    stream.pipe(res);
  } catch (error) {
    console.error('Error downloading fisier:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'FISIER',
      entity_id: id,
      summary: `Eroare la descărcarea fișierului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

export {
  uploadFisier,
  uploadMultipleFiles,
  getFisiereByDocumentId,
  getAllFiles,
  deleteFisierById,
  downloadFisier,
};

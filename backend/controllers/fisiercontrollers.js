import fs from 'fs';
import path from 'path';
import sequelize from '../utils/database.js';
import fisierService from '../services/fisierService.js';
import { myCache } from '../middleware/cacheMiddleware.js';

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
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error uploading fisier:', error);
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
    myCache.del(key);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
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
    res.json(fisiere);
  } catch (error) {
    console.error('Error fetching all fisiere:', error);
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
    res.json(fisiere);
  } catch (error) {
    console.error('Error fetching fisiere:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteFisierById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await sequelize.transaction(async (t) => {
      const deleted = await fisierService.deleteFisierById(id, t);
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
    res.status(500).json({ error: error.message });
  }
};

const downloadFisier = async (req, res) => {
  const { id } = req.params;
  try {
    const fisier = await fisierService.findFisierById(id);
    if (!fisier) {
      return res.status(404).json({ error: 'Fisier negăsit' });
    }
    const absolutePath = path.resolve(fisier.file_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Fișierul nu există pe disc' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fisier.original_name)}"`);
    res.setHeader('Content-Type', fisier.mime_type || 'application/octet-stream');
    res.sendFile(absolutePath);
  } catch (error) {
    console.error('Error downloading fisier:', error);
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

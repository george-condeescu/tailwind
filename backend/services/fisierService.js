import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { pipeline } from 'stream/promises';

import pool from '../utils/db.js'; // Import conexiunea la baza de date
import Fisier from '../models/fisier.js';
import Document from '../models/document.js';
import { parse } from 'node:path';

const processFileUpload = async (file, document_id, uploaded_by_user_id) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const tempPath = file.path;
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  const client = await pool.getConnection();
  try {
    //A. Calcul hash SHA256 (Stream-ul nu incarca tot fisierul in RAM)
    const hash = crypto.createHash('sha256');
    await pipeline(fs.createReadStream(tempPath), hash);
    const fileHash = hash.digest('hex');
    //B. Verificam daca exista deja un fisier cu acelasi hash pentru acelasi document
    // const existingFile = await Fisier.findOne({
    //   where: { document_id, sha256: fileHash },
    // });

    // if (existingFile) {
    //   // Ștergem fișierul temporar deoarece este un duplicat
    //   if (fs.existsSync(tempPath)) {
    //     await fs.promises.unlink(tempPath);
    //   }
    //   return {
    //     id: existingFile.id,
    //     isDuplicate: true,
    //     message:
    //       'Un fișier identic a fost deja încărcat pentru acest document. Nu a fost încărcat din nou.',
    //   };
    // }
    //C. Incepem tranzactia pentru noul fisier
    await client.query('BEGIN');
    const insertQuery =
      'INSERT INTO document_attachments (document_id, original_name, file_name, mime_type, file_path, sha256, uploaded_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';

    const [result] = await client.query(insertQuery, [
      parseInt(document_id, 10),
      file.originalname,
      file.filename,
      file.mimetype,
      tempPath,
      fileHash,
      parseInt(uploaded_by_user_id, 10),
    ]);

    await client.query('COMMIT');

    return {
      id: result.insertId,
      isDuplicate: false,
      message: 'Fișierul a fost încărcat cu succes.',
    };
  } catch (err) {
    await client.query('ROLLBACK');
    //Cleanup: ștergem fișierul temporar în caz de eroare
    if (fs.existsSync(tempPath)) {
      await fs.promises.unlink(tempPath);
    }
    console.error('Eroare la procesarea fișierului:', err);
    throw err;
  } finally {
    client.release();
  }
};

const processMultipleUploads = async (files) => {
  const uploadResults = [];

  // Procesăm fișierele secvențial pentru a menține controlul asupra tranzacțiilor
  for (const file of files) {
    try {
      // Refolosim logica de la single upload creată anterior
      const result = await processFileUpload(
        file,
        file.document_id,
        file.uploaded_by_user_id,
      );
      uploadResults.push({
        name: file.originalname,
        status: 'success',
        data: result,
      });
    } catch (error) {
      uploadResults.push({
        name: file.originalname,
        status: 'error',
        error: error.message,
      });
      // Opțional: Poți opri tot procesul aici sau poți continua cu restul fișierelor
    }
  }

  return uploadResults;
};

const findFisierById = async (id) => {
  return Fisier.findByPk(id);
};

const findFisiereByDocumentId = async (documentId) => {
  try {
    const fisiere = await Fisier.findAll({
      where: { document_id: documentId },
      order: [['createdAt', 'DESC']],
    });
    return fisiere;
  } catch (error) {
    console.error('Error fetching fisiere:', error);
    throw error;
  }
};

const getAllFiles = async () => {
  try {
    const fisiere = await Fisier.findAll({
      order: [['createdAt', 'DESC']],
    });
    return fisiere;
  } catch (error) {
    console.error('Error fetching all fisiere:', error);
    throw error;
  }
};

const deleteFisierById = async (id, transaction) => {
  const fisier = await Fisier.findByPk(id, { transaction });
  if (!fisier) {
    return null;
  }

  // Ștergem fișierul fizic de pe disc
  if (fs.existsSync(fisier.file_path)) {
    await fs.promises.unlink(fisier.file_path);
  }

  // Ștergem înregistrarea din baza de date
  const documentId = fisier.document_id;
  await fisier.destroy({ transaction });
  return documentId;
};

export default {
  processFileUpload,
  processMultipleUploads,
  findFisierById,
  findFisiereByDocumentId,
  getAllFiles,
  deleteFisierById,
};

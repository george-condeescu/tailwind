import sequelize from '../utils/database.js';
import comentariuService from '../services/comentariuService.js';
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

// create a new comentariu ==> POST /api/comentarii
const createComentariu = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const result = await sequelize.transaction(async (t) => {
      const newComentariu = await comentariuService.createComentariu(
        req.body,
        t,
      );
      const allComentariiKey = '__cache__/api/comentarii';
      myCache.del(key);
      myCache.del(allComentariiKey);
      //sterg si lista de comentarii pentru documentul respectiv
      const documentComentariiKey = `__cache__/api/comentarii/document/${newComentariu.document_id}`;
      myCache.del(documentComentariiKey);
      await logAuditEvent(t.connection, {
        req,
        action: 'CREATE',
        entity_type: 'COMENTARIU',
        entity_id: newComentariu.id,
        summary: `Comentariu nou creat cu ID: ${newComentariu.id} pentru documentul ${newComentariu.document_id}.`,
        after_data: newComentariu,
      });
      return newComentariu;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating comentariu:', error);
    await auditWithNewConn(req, {
      action: 'CREATE_ERROR',
      entity_type: 'COMENTARIU',
      entity_id: null,
      summary: `Eroare la crearea comentariului: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

// get all comentarii ==> GET /api/comentarii
const getAllComentarii = async (req, res) => {
  try {
    const comentarii = await comentariuService.getAllComentarii();
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'COMENTARIU',
      entity_id: null,
      summary: `Listare toate comentariile (${comentarii.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(200).json(comentarii);
  } catch (error) {
    console.error('Error fetching all comentarii:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'COMENTARIU',
      entity_id: null,
      summary: `Eroare la listarea comentariilor: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

// get comentariu by id ==> GET /api/comentarii/:id
const getComentariuById = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const comentariu = await comentariuService.findComentariuById(
      req.params.id,
    );
    if (!comentariu) {
      await auditWithNewConn(req, {
        action: 'READ_NOT_FOUND',
        entity_type: 'COMENTARIU',
        entity_id: req.params.id,
        summary: `Comentariul cu ID: ${req.params.id} nu a fost găsit.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(404).json({ error: 'Comentariu not found' });
    }
    myCache.set(key, comentariu, 300);
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'COMENTARIU',
      entity_id: req.params.id,
      summary: `Comentariul cu ID: ${req.params.id} accesat.`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(comentariu);
  } catch (error) {
    console.error('Error fetching comentariu:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'COMENTARIU',
      entity_id: req.params.id,
      summary: `Eroare la accesarea comentariului cu ID: ${req.params.id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

// get comentarii by document_id ==> GET /api/comentarii/document/:document_id
const getComentariiByDocumentId = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const comentarii = await comentariuService.findComentariuByDocumentId(
      req.params.document_id,
    );
    if (!comentarii || comentarii.length === 0) {
      await auditWithNewConn(req, {
        action: 'READ',
        entity_type: 'COMENTARIU',
        entity_id: req.params.document_id,
        summary: `Niciun comentariu găsit pentru documentul cu ID: ${req.params.document_id}.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(204).json({ comentarii: [] }); // Return empty array if no comentarii are found, allowing the frontend to handle this case gracefully
    }
    myCache.set(key, comentarii, 300);
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'COMENTARIU',
      entity_id: req.params.document_id,
      summary: `Comentarii pentru documentul cu ID: ${req.params.document_id} accesate (${comentarii.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(200).json(comentarii);
  } catch (error) {
    console.error('Error fetching comentarii by document_id:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'COMENTARIU',
      entity_id: req.params.document_id,
      summary: `Eroare la accesarea comentariilor pentru documentul cu ID: ${req.params.document_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

// update comentariu ==> PUT /api/comentarii/:id
const updateComentariu = async (req, res) => {
  try {
    const before = await comentariuService.findComentariuById(req.params.id);
    const result = await sequelize.transaction(async (t) => {
      const updatedComentariu = await comentariuService.updateComentariu(
        req.params.id,
        req.body,
        t,
      );

      //sterg si lista generala de comentarii
      const allComentariiKey = '__cache__/api/comentarii';
      myCache.del(allComentariiKey);
      //sterg si lista de comentarii pentru documentul respectiv
      const documentComentariiKey = `__cache__/api/comentarii/document/${updatedComentariu.document_id}`;
      myCache.del(documentComentariiKey);

      await logAuditEvent(t.connection, {
        req,
        action: 'UPDATE',
        entity_type: 'COMENTARIU',
        entity_id: req.params.id,
        summary: `Comentariul cu ID: ${req.params.id} actualizat.`,
        before_data: before,
        after_data: updatedComentariu,
      });
      return updatedComentariu;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating comentariu:', error);
    await auditWithNewConn(req, {
      action: 'UPDATE_ERROR',
      entity_type: 'COMENTARIU',
      entity_id: req.params.id,
      summary: `Eroare la actualizarea comentariului cu ID: ${req.params.id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const deleteComentariu = async (req, res) => {
  try {
    const before = await comentariuService.findComentariuById(req.params.id);
    await sequelize.transaction(async (t) => {
      await comentariuService.deleteComentariu(req.params.id, t);

      //sterg si lista generala de comentarii
      const allComentariiKey = '__cache__/api/comentarii';
      myCache.del(allComentariiKey);
      //sterg si lista de comentarii pentru documentul respectiv
      const documentComentariiKey = `__cache__/api/comentarii/document/${req.params.document_id}`;
      myCache.del(documentComentariiKey);

      await logAuditEvent(t.connection, {
        req,
        action: 'DELETE',
        entity_type: 'COMENTARIU',
        entity_id: req.params.id,
        summary: `Comentariul cu ID: ${req.params.id} șters.`,
        before_data: before,
      });
    });
    res.json({ message: 'Comentariu deleted successfully' });
  } catch (error) {
    console.error('Error deleting comentariu:', error);
    await auditWithNewConn(req, {
      action: 'DELETE_ERROR',
      entity_type: 'COMENTARIU',
      entity_id: req.params.id,
      summary: `Eroare la ștergerea comentariului cu ID: ${req.params.id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

export {
  createComentariu,
  getAllComentarii,
  getComentariuById,
  getComentariiByDocumentId,
  updateComentariu,
  deleteComentariu,
};

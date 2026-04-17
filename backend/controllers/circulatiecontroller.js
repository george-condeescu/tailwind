import sequelize from '../utils/database.js';
import circulatieService from '../services/circulatieService.js';
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

const createCirculatie = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const newCirculatie = await circulatieService.createCirculatie(
        req.body,
        t,
      );
      await logAuditEvent(t.connection, {
        req,
        action: 'CREATE',
        entity_type: 'CIRCULATIE',
        entity_id: newCirculatie.id,
        summary: `Circulație nouă creată cu ID: ${newCirculatie.id}.`,
        after_data: newCirculatie,
      });
      return newCirculatie;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating circulatie:', error);
    await auditWithNewConn(req, {
      action: 'CREATE_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: null,
      summary: `Eroare la crearea circulației: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const trimiteDocument = async (req, res) => {
  const { document_id, from_user_id, to_user_id, note } = req.body;
  try {
    const result = await sequelize.transaction(async (t) => {
      const newCirculatie = await circulatieService.trimiteDocument(
        document_id,
        to_user_id,
        from_user_id,
        note,
        t,
      );
      myCache.del(`__cache__/api/documents/${document_id}`);
      myCache.del(`__cache__/api/documents/user/${to_user_id}/inbox`);
      myCache.del(`__cache__/api/documents/user/${to_user_id}/inbox/count`);
      await logAuditEvent(t.connection, {
        req,
        action: 'CREATE',
        entity_type: 'CIRCULATIE',
        entity_id: newCirculatie.id,
        summary: `Documentul ${document_id} trimis de utilizatorul ${from_user_id} către ${to_user_id}.`,
        after_data: newCirculatie,
      });
      return newCirculatie;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error sending document:', error);
    await auditWithNewConn(req, {
      action: 'CREATE_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: null,
      summary: `Eroare la trimiterea documentului ${document_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const closeCirculatie = async (req, res) => {
  const { document_id } = req.params;
  try {
    const result = await sequelize.transaction(async (t) => {
      const closedCirculatie = await circulatieService.closeCirculatie(
        document_id,
        t,
      );
      myCache.del(`__cache__/api/documents/${document_id}`);
      myCache.del(
        `__cache__/api/documents/user/${closedCirculatie.to_user_id}/inbox`,
      );
      myCache.del(
        `__cache__/api/documents/user/${closedCirculatie.to_user_id}/inbox/count`,
      );
      await logAuditEvent(t.connection, {
        req,
        action: 'UPDATE',
        entity_type: 'CIRCULATIE',
        entity_id: closedCirculatie.id,
        summary: `Circulația documentului ${document_id} închisă.`,
        after_data: closedCirculatie,
      });
      return closedCirculatie;
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error closing circulatie:', error);
    await auditWithNewConn(req, {
      action: 'UPDATE_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: null,
      summary: `Eroare la închiderea circulației pentru documentul ${document_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const getCirculatieById = async (req, res) => {
  try {
    const circulatie = await circulatieService.findCirculatieById(
      req.params.id,
    );
    if (!circulatie) {
      await auditWithNewConn(req, {
        action: 'READ_NOT_FOUND',
        entity_type: 'CIRCULATIE',
        entity_id: req.params.id,
        summary: `Circulația cu ID: ${req.params.id} nu a fost găsită.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(404).json({ error: 'Circulatie not found' });
    }
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.id,
      summary: `Circulația cu ID: ${req.params.id} accesată.`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(circulatie);
  } catch (error) {
    console.error('Error fetching circulatie:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.id,
      summary: `Eroare la accesarea circulației cu ID: ${req.params.id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const getCirculatieByNrInreg = async (req, res) => {
  try {
    const circulatie = await circulatieService.findCirculatieByNrInreg(
      req.params.nr_inreg,
    );
    if (!circulatie) {
      await auditWithNewConn(req, {
        action: 'READ_NOT_FOUND',
        entity_type: 'CIRCULATIE',
        entity_id: req.params.nr_inreg,
        summary: `Circulația pentru nr_inreg: ${req.params.nr_inreg} nu a fost găsită.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(404).json({ error: 'Circulatie not found' });
    }
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.nr_inreg,
      summary: `Circulație pentru nr_inreg: ${req.params.nr_inreg} accesată.`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(circulatie);
  } catch (error) {
    console.error('Error fetching circulatie by nr_inreg:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.nr_inreg,
      summary: `Eroare la accesarea circulației pentru nr_inreg: ${req.params.nr_inreg}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const getCirculatiiByUserId = async (req, res) => {
  try {
    const circulatii = await circulatieService.findCirculatiiByUserId(
      req.params.user_id,
    );
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.user_id,
      summary: `Circulații pentru utilizatorul ${req.params.user_id} accesate (${circulatii.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(circulatii);
  } catch (error) {
    console.error('Error fetching circulatii by user_id:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.user_id,
      summary: `Eroare la accesarea circulațiilor pentru utilizatorul ${req.params.user_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const getCirculatieByDocumentId = async (req, res) => {
  try {
    const circulatii = await circulatieService.findCirculatieByDocumentId(
      req.params.document_id,
    );
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.document_id,
      summary: `Circulații pentru documentul ${req.params.document_id} accesate (${circulatii.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.json(circulatii);
  } catch (error) {
    console.error('Error fetching circulatie by document_id:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.document_id,
      summary: `Eroare la accesarea circulațiilor pentru documentul ${req.params.document_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const updateCirculatie = async (req, res) => {
  try {
    const before = await circulatieService.findCirculatieById(req.params.id);
    const result = await sequelize.transaction(async (t) => {
      const updatedCirculatie = await circulatieService.updateCirculatie(
        req.params.id,
        req.body,
        t,
      );
      await logAuditEvent(t.connection, {
        req,
        action: 'UPDATE',
        entity_type: 'CIRCULATIE',
        entity_id: req.params.id,
        summary: `Circulația cu ID: ${req.params.id} actualizată.`,
        before_data: before,
        after_data: updatedCirculatie,
      });
      return updatedCirculatie;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating circulatie:', error);
    await auditWithNewConn(req, {
      action: 'UPDATE_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.id,
      summary: `Eroare la actualizarea circulației cu ID: ${req.params.id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const deleteCirculatie = async (req, res) => {
  try {
    const before = await circulatieService.findCirculatieById(req.params.id);
    await sequelize.transaction(async (t) => {
      await circulatieService.deleteCirculatie(req.params.id, t);
      await logAuditEvent(t.connection, {
        req,
        action: 'DELETE',
        entity_type: 'CIRCULATIE',
        entity_id: req.params.id,
        summary: `Circulația cu ID: ${req.params.id} ștearsă.`,
        before_data: before,
      });
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting circulatie:', error);
    await auditWithNewConn(req, {
      action: 'DELETE_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: req.params.id,
      summary: `Eroare la ștergerea circulației cu ID: ${req.params.id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const getLastSender = async (req, res) => {
  const { document_id, user_id } = req.params;

  try {
    const lastSender = await sequelize.query(
      `
       select circ.from_user_id, u.full_name from document_circulation circ
       inner join documents doc on circ.document_id=doc.id
       inner join users u on circ.from_user_id=u.id
       where doc.id=:document_id and doc.current_user_id=:user_id and circ.to_user_id=:user_id
       order by circ.data_intrare desc
       limit 1;
    `,
      {
        replacements: { document_id, user_id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (!lastSender || lastSender.length === 0) {
      return res.status(204).json({ lastSender: null });
    }
    res.json(lastSender[0]);
  } catch (error) {
    console.error('Error fetching last sender:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: document_id,
      summary: `Eroare la accesarea ultimului expeditor pentru documentul ${document_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const getLastCirculatieByDocumentId = async (req, res) => {
  const { document_id } = req.params;

  try {
    const lastCirculatie =
      await circulatieService.getLastCirculatieByDocumentId(document_id);

    if (!lastCirculatie || lastCirculatie.length === 0) {
      return res.status(204).json({ lastCirculatie: null });
    }
    res.json(lastCirculatie[0]);
  } catch (error) {
    console.error('Error fetching last circulatie by document_id:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: document_id,
      summary: `Eroare la accesarea ultimei circulații pentru documentul ${document_id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

const markCirculatieAsCitit = async (req, res) => {
  const { circulatie_id } = req.params;
  const { user_id } = req.body;

  try {
    await circulatieService.markCitit(circulatie_id);
    if (user_id) {
      myCache.del(`__cache__/api/documents/user/${user_id}/inbox`);
      myCache.del(`__cache__/api/documents/user/${user_id}/inbox/count`);
    }
    await auditWithNewConn(req, {
      action: 'UPDATE',
      entity_type: 'CIRCULATIE',
      entity_id: circulatie_id,
      summary: `Circulația cu ID: ${circulatie_id} marcată ca citită de utilizatorul ${user_id ?? 'necunoscut'}.`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(200).json({ message: 'Circulatie marked as citit' });
  } catch (error) {
    console.error('Error marking circulatie as citit:', error);
    await auditWithNewConn(req, {
      action: 'UPDATE_ERROR',
      entity_type: 'CIRCULATIE',
      entity_id: circulatie_id,
      summary: `Eroare la marcarea circulației ${circulatie_id} ca citită: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ error: error.message });
  }
};

export {
  createCirculatie,
  getCirculatieById,
  getCirculatieByNrInreg,
  getCirculatiiByUserId,
  getCirculatieByDocumentId,
  updateCirculatie,
  deleteCirculatie,
  getLastSender,
  trimiteDocument,
  getLastCirculatieByDocumentId,
  markCirculatieAsCitit,
  closeCirculatie,
};

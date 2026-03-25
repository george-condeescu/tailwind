import sequelize from '../utils/database.js';
import circulatieService from '../services/circulatieService.js';
import { myCache } from '../middleware/cacheMiddleware.js';

const createCirculatie = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const newCirculatie = await circulatieService.createCirculatie(
        req.body,
        t,
      );
      return newCirculatie;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating circulatie:', error);
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
      return newCirculatie;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error sending document:', error);
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
      return closedCirculatie;
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error closing circulatie:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCirculatieById = async (req, res) => {
  try {
    const circulatie = await circulatieService.findCirculatieById(
      req.params.id,
    );
    if (!circulatie) {
      return res.status(404).json({ error: 'Circulatie not found' });
    }
    res.json(circulatie);
  } catch (error) {
    console.error('Error fetching circulatie:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCirculatieByNrInreg = async (req, res) => {
  try {
    const circulatie = await circulatieService.findCirculatieByNrInreg(
      req.params.nr_inreg,
    );
    if (!circulatie) {
      return res.status(404).json({ error: 'Circulatie not found' });
    }
    res.json(circulatie);
  } catch (error) {
    console.error('Error fetching circulatie by nr_inreg:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCirculatiiByUserId = async (req, res) => {
  try {
    const circulatii = await circulatieService.findCirculatiiByUserId(
      req.params.user_id,
    );
    res.json(circulatii);
  } catch (error) {
    console.error('Error fetching circulatii by user_id:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCirculatieByDocumentId = async (req, res) => {
  try {
    const circulatii = await circulatieService.findCirculatieByDocumentId(
      req.params.document_id,
    );
    res.json(circulatii);
  } catch (error) {
    console.error('Error fetching circulatie by document_id:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateCirculatie = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const updatedCirculatie = await circulatieService.updateCirculatie(
        req.params.id,
        req.body,
        t,
      );
      return updatedCirculatie;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating circulatie:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCirculatie = async (req, res) => {
  try {
    await sequelize.transaction(async (t) => {
      await circulatieService.deleteCirculatie(req.params.id, t);
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting circulatie:', error);
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
      // return null; // Return null if no last sender is found, allowing the frontend to handle this case gracefully
    }
    res.json(lastSender[0]);
  } catch (error) {
    console.error('Error fetching last sender:', error);
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
    res.status(200).json({ message: 'Circulatie marked as citit' });
  } catch (error) {
    console.error('Error marking circulatie as citit:', error);
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

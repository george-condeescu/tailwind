import sequelize from '../utils/database.js';
import registruService from '../services/registruService.js';
import circulatieService from '../services/circulatieService.js';
import documentService from '../services/documentService.js';
import { id } from 'zod/v4/locales';

const createRegistruWorkflow = async (req, res) => {
  // console.log(
  //   'Received request to create Registru workflow with data in controller:',
  //   req.body,
  // );
  try {
    const result = await sequelize.transaction(async (t) => {
      const newRegistru = await registruService.createRegistru(req.body, t);

      // aici avem eroarea nu avem deocamdata registru_id in request body
      const newDocument = await documentService.createDocument(
        {
          ...req.body,
          created_by_user_id: req.body.user_id,
          current_user_id: req.body.user_id,
          content_snapshot: JSON.stringify(newRegistru),
          note: 'Initial creation',
        },
        t,
      );
      // console.log('Created new Document:', newDocument);
      const newCirculatie = await circulatieService.createCirculatie(
        {
          ...req.body,
          document_id: newDocument.id,
          action: 'RECEIVE',
          from_user_id: req.body.user_id,
          to_user_id: null,
          // created_by_user_id: req.body.user_id,
          note: 'Initial circulation',
        },
        t,
      );
      console.log('Created new circulatie:', newCirculatie);

      return { newRegistru, newCirculatie, newDocument };
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating registru workflow:', error);
    res.status(500).json({ error: error.message });
  }
};

export { createRegistruWorkflow };

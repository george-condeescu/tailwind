import { Comentariu } from '../models/index.js';
import sequelize from '../utils/database.js';

const createComentariu = async (data, transaction = null) => {
  try {
    const newComentariu = await Comentariu.create(data, { transaction });
    return newComentariu;
  } catch (error) {
    console.error('Error creating comentariu:', error);
    throw error;
  }
};

const findComentariuByDocumentId = async (document_id) => {
  try {
    const comentarii = await Comentariu.findAll({ where: { document_id } });
    console.log(
      'Comentarii found for document_id',
      document_id,
      ':',
      comentarii,
    );
    return comentarii;
  } catch (error) {
    console.error('Error finding comentariu by document_id:', error);
    throw error;
  }
};

const findComentariuById = async (id) => {
  try {
    const comentariu = await Comentariu.findByPk(id);
    return comentariu;
  } catch (error) {
    console.error('Error finding comentariu by id:', error);
    throw error;
  }
};

const updateComentariu = async (id, data, transaction = null) => {
  try {
    const comentariu = await Comentariu.findByPk(id);
    if (!comentariu) {
      throw new Error('Comentariu not found');
    }
    await comentariu.update(data, { transaction });
    return comentariu;
  } catch (error) {
    console.error('Error updating comentariu:', error);
    throw error;
  }
};

const deleteComentariu = async (id, transaction = null) => {
  try {
    const comentariu = await Comentariu.findByPk(id);
    if (!comentariu) {
      throw new Error('Comentariu not found');
    }
    await comentariu.destroy({ transaction });
    return true;
  } catch (error) {
    console.error('Error deleting comentariu:', error);
    throw error;
  }
};

const getAllComentarii = async () => {
  try {
    const comentarii = await Comentariu.findAll();
    return comentarii;
  } catch (error) {
    console.error('Error fetching all comentarii:', error);
    throw error;
  }
};

export default {
  createComentariu,
  findComentariuByDocumentId,
  findComentariuById,
  getAllComentarii,
  updateComentariu,
  deleteComentariu,
};

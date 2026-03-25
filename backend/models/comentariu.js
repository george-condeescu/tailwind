import { DataTypes, INTEGER } from 'sequelize';
import sequelize from '../utils/database.js';

const Comentariu = sequelize.define(
  'Comentariu',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data_modif: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    persoana: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'comments',
    timestamps: false,
  },
);

export default Comentariu;

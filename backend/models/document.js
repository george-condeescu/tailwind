import { DataTypes, ENUM, INTEGER, TEXT } from 'sequelize';
import sequelize from '../utils/database.js';

const Document = sequelize.define(
  'Document',
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nr_inreg: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    nr_revizie: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    created_by_user_id: {
      type: INTEGER,
      allowNull: false,
    },
    current_user_id: {
      type: INTEGER,
      allowNull: false,
    },
    content_snapshot: {
      type: TEXT,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'documents',
    timestamps: true,
  },
);

export default Document;

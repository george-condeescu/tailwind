import { DataTypes, INTEGER } from 'sequelize';
import sequelize from '../utils/database.js';

const Fisier = sequelize.define(
  'Fisier',
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
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sha256: {
      type: DataTypes.CHAR(64),
      allowNull: false,
    },
    uploaded_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'document_attachments',
    timestamps: true,
  },
);

export default Fisier;

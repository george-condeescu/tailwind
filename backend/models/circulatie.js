import { DataTypes, INTEGER } from 'sequelize';
import sequelize from '../utils/database.js';

const Circulatie = sequelize.define(
  'Circulatie',
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
    action: {
      type: DataTypes.ENUM('SEND', 'RECEIVE', 'RETURN', 'CLOSE', 'CANCEL', 'DRAFT'),
      allowNull: false,
    },
    from_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    to_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_intrare: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    data_iesire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    citit: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'document_circulation',
    timestamps: true,
  },
);

export default Circulatie;

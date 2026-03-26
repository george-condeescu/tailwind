import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

const Ticket = sequelize.define(
  'Ticket',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subiect: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mesaj: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('nou', 'in_lucru', 'rezolvat'),
      defaultValue: 'nou',
    },
    prioritate: {
      type: DataTypes.ENUM('scazuta', 'medie', 'ridicata'),
      defaultValue: 'medie',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fisiere: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    admin_mesaj: {
      type: DataTypes.TEXT,
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
    tableName: 'tickets',
    timestamps: true,
  },
);

export default Ticket;

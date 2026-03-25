import { DataTypes, INTEGER } from 'sequelize';
import sequelize from '../utils/database.js';

const Partner = sequelize.define(
  'Partner',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    denumire: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    adresa: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cui: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    reg_com: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tara: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    judet: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    localitate: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    telefon: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'partner',
  },
);

export default Partner;

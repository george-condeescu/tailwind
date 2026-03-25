import { DataTypes, ENUM, INTEGER } from 'sequelize';
import sequelize from '../utils/database.js';

const Registru = sequelize.define(
  'Registru',
  {
    nr_inreg: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    observatii: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
    partener_id: {
      type: INTEGER,
      allowNull: false,
    },
    obiectul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cod_ssi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cod_angajament: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: ENUM('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED'),
      allowNull: false,
      defaultValue: 'DRAFT',
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
    tableName: 'registers',
    timestamps: true,
  },
);

export default Registru;

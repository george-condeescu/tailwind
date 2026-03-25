import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

// Define the Departament model
const OrgUnit = sequelize.define(
  'OrgUnit',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('DIRECTIE', 'SERVICIU', 'COMPARTIMENT', 'CONDUCERE'),
      allowNull: false,
      unique: true,
    },

    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'org_units', // Specify the table name
    timestamps: false,
  },
);

export default OrgUnit;

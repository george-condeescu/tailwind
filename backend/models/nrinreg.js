import { DataTypes, INTEGER } from 'sequelize';
import sequelize from '../utils/database.js';

const Nrinreg = sequelize.define(
  'Nrinreg',
  {
    departament: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    last_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'id_counters',
  },
);

export default Nrinreg;

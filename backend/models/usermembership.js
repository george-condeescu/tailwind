// models/usermembership.js

import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

  const UserMembership = sequelize.define("UserMembership", {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    org_unit_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE
  }, {
    tableName: "user_membership",
    timestamps: true
  });

export default UserMembership;

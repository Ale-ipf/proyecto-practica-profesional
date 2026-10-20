import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const InstitutionModel = sequelize.define("Institution", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  abbreviation: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
}, {
  timestamps: false,
});

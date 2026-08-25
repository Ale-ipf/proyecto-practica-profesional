import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const PropertyImage = sequelize.define("PropertyImage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

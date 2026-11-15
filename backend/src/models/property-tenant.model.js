import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const PropertyTenantModel = sequelize.define(
  "PropertyTenant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [{ unique: true, fields: ["propertyId", "userId"] }],
  },
);

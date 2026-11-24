import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const PropertyGuaranteeAccessRequestModel = sequelize.define(
  "PropertyGuaranteeAccessRequest",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "revoked", "expired"),
      allowNull: false,
      defaultValue: "pending",
    },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    lastAccessAt: { type: DataTypes.DATE, allowNull: true },
  },
  { indexes: [{ unique: true, fields: ["propertyId", "studentId"] }] },
);

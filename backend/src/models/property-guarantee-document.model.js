import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const PropertyGuaranteeDocumentModel = sequelize.define(
  "PropertyGuaranteeDocument",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    documentType: {
      type: DataTypes.ENUM("title_deed", "domain_report", "consent"),
      allowNull: false,
    },
    publicId: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    originalName: { type: DataTypes.STRING(255), allowNull: false },
    mimeType: { type: DataTypes.STRING(100), allowNull: false },
    uploadedBy: { type: DataTypes.INTEGER, allowNull: false },
  },
);

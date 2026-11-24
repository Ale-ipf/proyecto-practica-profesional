import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const RentPaymentModel = sequelize.define(
  "RentPayment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    propertyTenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    period: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "transfer"),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    indexes: [{ unique: true, fields: ["propertyTenantId", "period"] }],
  },
);

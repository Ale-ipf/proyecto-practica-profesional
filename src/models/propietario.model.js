import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const PropertyModel = sequelize.define("Property", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  is_furnished: {
    type: DataTypes.BOOLEAN, // Amoblado
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM("available", "rented"),
    defaultValue: "available",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
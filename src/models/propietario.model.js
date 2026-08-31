import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Property = sequelize.define("Property", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
    allowNull: false,
  },

  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  neighborhood: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  type: {
    type: DataTypes.ENUM("house", "apartment", "room"),
    allowNull: false,
  },

  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const PropertyForumMessageModel = sequelize.define("PropertyForumMessage", {
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
  category: {
    type: DataTypes.ENUM("notice", "announcement", "issue", "general"),
    allowNull: false,
    defaultValue: "general",
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const StudentModel = sequelize.define("Student", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  university: {
    type: DataTypes.STRING(150), // Ej: "Universidad Nacional"
    allowNull: true,
  },
  career: {
    type: DataTypes.STRING(150), // Ej: "Ingeniería en Sistemas"
    allowNull: true,
  },
  origin_city: {
    type: DataTypes.STRING(100), // Ciudad o provincia de origen
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Relación 1 a 1 con User
  },
});
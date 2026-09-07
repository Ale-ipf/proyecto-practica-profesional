import { DataTypes } from 'sequelize';
import Sequelize from 'sequelize';

export const Usuario = Sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('estudiante', 'dueno'),
    allowNull: false,
    defaultValue: 'estudiante',
  },
  telefono: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  fotoPerfil: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
});
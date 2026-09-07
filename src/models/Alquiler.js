import { DataTypes } from 'sequelize';
import { Sequelize } from 'sequelize';

export const Alquiler = Sequelize.define('Alquiler', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  habitaciones: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: true, // Guarda la ruta /uploads/imagen.jpg
  }
}, {
  tableName: 'alquileres',
  timestamps: true,
});
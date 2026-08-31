import { Usuario } from './Usuario.js';
import { Alquiler } from './Alquiler.js';

// Relaciones 1:N (Un dueño tiene muchos alquileres publicados)
Usuario.hasMany(Alquiler, {
  foreignKey: 'duenoId',
  as: 'alquileres',
  onDelete: 'CASCADE',
});

Alquiler.belongsTo(Usuario, {
  foreignKey: 'duenoId',
  as: 'dueno',
});

export { Usuario, Alquiler };
console.log("hola mundo");

import { Sequelize } from "sequelize";

// conexion a la base de datos

export const sequelize = new Sequelize("Bd_alquileres", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// testear la conexion

export const startDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log("Conexion a la db esta lista");
  } catch (error) {
    console.error("No se pudo conectar a la db:", error);
  }
};

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.NAME_BD, process.env.USER_BD, process.env.PASSWORD_BD, {
  host: process.env.SERVER_BD,

  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
});

// Exporta la instancia de Sequelize para su uso en otros archivos
export default sequelize;
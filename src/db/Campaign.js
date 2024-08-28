import sql from 'mssql'
import moment from 'moment';

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.DB_server,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

const getCampaignsCompanies = async () => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * from maorigen WHERE imercadeo = 1`
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getProducts = async (tableName) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT * from ${tableName}`)
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getClientsProduct = async (cramo, page) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`
      SELECT * FROM lista_clientes WHERE xcedula NOT IN (
        SELECT id FROM maVclientes_productos WHERE cramo = ${cramo}
      ) AND corigen = 1 
    `)
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
  
}

export default {
  getCampaignsCompanies,
  getProducts,
  getClientsProduct,
}
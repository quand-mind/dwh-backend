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
const queryRows = (firstItem) => {
  return `ORDER BY orden OFFSET ${parseInt(firstItem)} ROWS FETCH NEXT 10 ROWS ONLY`
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
const getProducts = async (corigen) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT * from magrupo_plan WHERE corigen = ${corigen}`)
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getClientsProduct = async (corigen, cramo, data) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`
      SELECT orden, xnombre, cid FROM lista_clientes WHERE xcedula NOT IN (
        SELECT id FROM maVclientes_productos WHERE cramo = ${cramo}
      ) AND corigen = ${corigen}
    `)
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
  
}
const getProductsPlan = async (corigen, cramo, data) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`
      SELECT id, cramo, corigen, xplan from maplanes where corigen = ${corigen} and cramo = ${cramo} and xplan IS NOT null and bactivo = 1
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
  getProductsPlan,
}
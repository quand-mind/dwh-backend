import sql from 'mssql'


const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  connectionTimeout: 150000,
  requestTimeout: 150000,
  server: process.env.DB_server,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 150000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

const getAllRamos = async () => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT * FROM maramos`
   
   const records = result.recordsets[0]
   
   return records
  } catch (err) {
   console.log('Error al obtener los ramos', err)
   return err
  }
}

const getGestores = async (ccanal) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   console.log(`SELECT * FROM magestor WHERE ccanalalt = ${ccanal}`);
   const result = await sql.query(`SELECT * FROM magestor WHERE ccanalalt = ${ccanal}`)
   
   const records = result.recordset
   
   return records
  } catch (err) {
   console.log('Error al obtener los ramos', err)
   return err
  }
}
const getOrigenes = async () => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT * FROM maorigen where bactivo = 1`
   
   const records = result.recordsets[0]
   
   return records
  } catch (err) {
   console.log('Error al obtener los origenes', err)
   return err
  }
}
const getOrigenesApi = async () => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`select distinct(LTRIM(RTRIM(xcanal_venta))) as text, LTRIM(RTRIM(corigen_rel)) as value from Sis2000..maclient_api`
   
   const records = result.recordsets[0]
   
   return records
  } catch (err) {
   console.log('Error al obtener los origenes', err)
   return err
  }
}
const getCanalesVenta = async () => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`select distinct(LTRIM(RTRIM(xcanalalt))) as text, LTRIM(RTRIM(ccanalalt)) as value from Sis2000..macanalalt`
   
   const records = result.recordsets[0]
   
   return records
  } catch (err) {
   console.log('Error al obtener los canales', err)
   return err
  }
}

export default {
  getAllRamos,
  getGestores,
  getOrigenes,
  getOrigenesApi,
  getCanalesVenta
}
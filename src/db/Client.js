import sql from 'mssql'

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

const getAllClientsAndSearch = async () => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT * FROM maclientes`
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}
const getClients = async (page) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const offsetRows = (page * 10) - 10
   const result = await sql.query`SELECT * FROM maclientes ORDER BY id OFFSET ${parseInt(offsetRows)} rows FETCH NEXT 10 rows ONLY`
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}
const countClients = async () => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT COUNT(*) FROM maclientes`
    return result.recordset[0]
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
export default {
  getClients,
  countClients,
  getAllClientsAndSearch,
}
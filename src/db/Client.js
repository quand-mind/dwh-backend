import sql from 'mssql'

let clientsData = []
let allClients = []

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

const getAllClients = async () => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT * FROM maclientes`
   clientsData = result.recordsets[0]
   allClients = result.recordsets[0]
   return clientsData
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}
const getAllClientsAndSearch = async (string) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   clientsData = await allClients
   if (string != '------'){
     clientsData = []

      for (const item of allClients) {
        const keys = Object.keys(item)
        const values = Object.values(item)
        for (const key of keys) {
          if (key.charAt(0) == 'i') {
            if(key == 'id') {
            } else if(key == 'isexo') {
              item['v'+key] = {values: ['M','F', 'N'], format:['Masculino', 'Femenino', 'No especificado']}
            } else if(key == 'iestado'){
              item['v'+key] = {values: ['V', 'E'], format:['Venezolano', 'Extranjero']}
            } else if(key == 'iestado_civil'){
              item['v'+key] == {values: ['C', 'S'],format: ['Casado', 'Soltero']}
            }
          }
        }
        
        const findedValue = values.find( value => {
          if (typeof value === 'string'){
            return value.toLowerCase().includes(string)
          }
        })
        if(findedValue) {
          clientsData.push(item)
        } 
      }

    }
    return clientsData
    
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
  //  const result = await sql.query`SELECT * FROM maclientes ORDER BY id OFFSET ${parseInt(offsetRows)} rows FETCH NEXT 10 rows ONLY`
  let result = []
  const clients = await clientsData
  if(clients.length > 0) {
    result = clients.slice(offsetRows, page * 10 )
  }
  
   return result
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}
const countClients = async () => {
  try {
    await sql.connect(sqlConfig)
    let result = {count: await clientsData.length}
    // let result = await sql.query`SELECT COUNT(*) FROM maclientes`
    return result
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
export default {
  getClients,
  countClients,
  getAllClientsAndSearch,
  getAllClients,
}
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
   const result = await sql.query`SELECT * FROM maVclientes_origen`
   
   const records = result.recordsets[0]
   clientsData = []
   for (const record of records){
    var nombre1 = ''
    var nombre2 = ''
    var apellido1 = ''
    var apellido2 = ''
    var nombrecompleto = ''
    var apellidocompleto = ''
    if(record.xnombre1){
      nombre1 = record.xnombre1
    } else {
      nombre1 = '------'
    }
    if(record.xnombre2){
      nombre2 = record.xnombre2
    } else {
      nombre2 = ''
    }
    if(record.xapellido1){
      apellido1 = record.xapellido1
    } else {
      apellido1 = '------'
    }
    if(record.xapellido2){
      apellido2 = record.xapellido2
    } else {
      apellido2 = ''
    }
    if(nombre2.length > 0) {
      nombrecompleto = nombre1 + ' ' + nombre2
    } else {
      nombrecompleto = nombre1
    }
    if(apellido2.length > 0) {
      apellidocompleto = apellido1 + ' ' + apellido2
    } else {
      apellidocompleto = apellido1
    }
    record.xnombrecompleto = nombrecompleto + ' ' + apellidocompleto
    clientsData.push(record)
   }
   
   allClients = result.recordsets[0]
   return clientsData
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}
const getAllClientsAndSearch = async (string, body) => {
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
            return value.toLowerCase().includes(string.toLowerCase())
          }
        })
        if(findedValue) {
          clientsData.push(item)
        } 
      }
      
    }
    const bodyKeys = Object.keys(body)
    console.log(body);
    if(bodyKeys.length > 0) {
      for (const key of bodyKeys) {
        let filterItems = []
        if(key[0].includes('f')){
          const value_splitted = body[key].split(' - ')
          let date1 = new Date(value_splitted[0]);
          let date2 = new Date(value_splitted[1]);
          filterItems = clientsData.filter(item => item[key] > date1 && item[key] < date2 )
        } else if(key.includes('_')) {
          const value_splitted = key.split('_')
          const clientsProducts = await getProductsByType(body[key])
          const arrayClients = []
          for( const product of clientsProducts) {
            const validClient = clientsData.find(item => item.cci_rif == product.cci_rif)
            arrayClients.push(validClient)
          }
          filterItems = arrayClients
        } else{
          filterItems = clientsData.filter(item => item[key] == body[key])
        }
        clientsData = filterItems
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

const getProducts = async (rif) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT * FROM maVclientes_productos WHERE cci_rif = ${rif}`
   
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los productos de los clientes', err)
   return err
  }
}

const getProductsByType = async (ramo) => {
  console.log(ramo);
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT * FROM maVclientes_productos WHERE cramo = ${ramo}`
   
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los productos de los clientes', err)
   return err
  }
}
export default {
  getClients,
  countClients,
  getAllClientsAndSearch,
  getAllClients,
  getProducts,
}
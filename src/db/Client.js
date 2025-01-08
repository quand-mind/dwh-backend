import sql from 'mssql'
import moment from 'moment';

let clientsData = []
let allClients = []
let countAllClients = 0

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  connectionTimeout: 50000,
  requestTimeout: 50000,
  server: process.env.DB_server,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 50000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

function compareByCode( a, b ) {
  if ( a.id < b.id ){
    return -1;
  }
  if ( a.id > b.id ){
    return 1;
  }
  return 0;
}

const setAllClients = async () => {
  try {
    await sql.connect(sqlConfig)
    if(!countAllClients) {
      const result = await sql.query(`SELECT COUNT(orden) AS count from lista_clientes`)
      countAllClients = result.recordsets[0][0].count
    }
    return countAllClients
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const queryRows = (firstItem) => {
  return `ORDER BY orden OFFSET ${parseInt(firstItem)} ROWS FETCH NEXT 10 ROWS ONLY`
}
const getAllClients = async (firstItem) => {
  
  try {
    const queryRowsA = queryRows(firstItem)
    await sql.connect(sqlConfig)
    const query = `SELECT cid, xnombre, corigen, xorigen, fnacimiento, orden, xtelefono1, xcompania, xcedula FROM lista_clientes`
    const result = await sql.query(`${query} ${queryRowsA}`)
    
    const records = result.recordsets[0]
    
    return {records, query}
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getClientData = async (orden) => {
  
  try {
    clientsData = []
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT * FROM lista_clientes WHERE orden = ${orden}`)

    const records = result.recordsets[0]
    records.forEach(item => {
      formatData(item)
    })
    
    return clientsData[0]
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}

const formatData = (item) => {
    clientsData.push(item)
}
const getDashboardClientData = async () => {
  
  try {
    // Array de Sistemas
    await sql.connect(sqlConfig)
    const objectItems = [
      {label: 'Sys2000', value: 1, color: '#000000'},
      {label: 'ArysAuto', value: 2, color: '#fdb101'},
      {label: 'ManMar', value: 3, color: '#334ebd'},
      {label: 'Beeinsurance', value: 4, color: '#F1B592'},
      {label: 'Pasarela de Ventas', value: 5, color: '#4A80F4'},
      {label: 'Logistika', value: 6, color: '#FF794B'}
    ]
    
    let records1 = []
    let records2 = []
    let recordsData1 = []
    let recordsData2 = []
    // Array de Meses
    let months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    let queryItems1 = ''
    let queryItems2 = ''

    let z = 1
    // Ciclo para obtener la totalidad de valores de cada sistema
    for(const objectItem of objectItems) {
      // Query del 1er gráfico
      queryItems1 += `SUM(CASE When corigen = ${objectItem.value} THEN 1 ELSE 0 END)`
      if(z<objectItems.length){
        queryItems1 += ','
      }

      let actualDate = new Date()
      const year = actualDate.getFullYear()
      let month = actualDate.getMonth()
      
      let actualMonth = month +1
      let actualYear = year - 1
      let x = 0
      let iter = 1
      // Ciclo para generar las fechas de cada mes y obtener los valores por mes
      while (x == 0) {
        
        let lastDate = moment(new Date(actualYear, actualMonth + 1, 0)).format('MM-DD-YYYY');
        let firstDate = moment(new Date(actualYear, actualMonth, 0)).format('MM-DD-YYYY');
        // Query del 2do gráfico
        queryItems2 += `SUM(CASE When corigen = ${objectItem.value} AND fcreacion >= '${firstDate}' AND fcreacion <= '${lastDate}' Then 1 Else 0 End)`

        actualMonth++
        // Cambio de año luego del mes 12 (11 porque el ciclo empieza en 0)
        if(actualMonth > 11) {
          actualMonth = 0
          actualYear++
        }
        if(actualMonth == month + 1 && x==0) {
          if(z<objectItems.length){
            queryItems2 += ',' 
          }
          x++
        } else {
          queryItems2 += ','
        }
        if (iter == 12 ) {
          x = 1
          // queryItems1 = queryItems1.slice(0, -1)
          
        }
        iter ++
      }
      z++
    }
    
    var lastChar = queryItems2.substr(queryItems2.length - 1)
    if(lastChar != ')'){
      queryItems2 = queryItems2.slice(0, -1)
    }
    const query1 = `SELECT ${queryItems1} FROM lista_clientes`
    const query2 = `SELECT ${queryItems2} FROM lista_clientes`
    
    
    let result1 = await sql.query(query1)
    records1 = result1.recordset[0]['']
    let result2 = await sql.query(query2)
    records2 = result2.recordset[0]['']

    let y = 0
    z = 0
    for(const objectItem of objectItems) {
      let actualDate = new Date()
      const year = actualDate.getFullYear()
      let month = actualDate.getMonth()
      let monthData = null
      
      let actualMonth = month +1
      let actualYear = year - 1
      let x = 0
      let item1 = {}
      let item2 = {}

      item1.color = objectItem.color
      item1.data = records1[y]
      item1.label = objectItem.label

      recordsData1.push(item1)

      item2.color = objectItem.color
      item2.data = []
      item2.label = objectItem.label
      let iter = 1


      while (x == 0) {
        let lastDate = new Date(actualYear, actualMonth + 1, 0);
        let firstDate = new Date(actualYear, actualMonth, 0);

        item2.data.push({label: months[actualMonth], data: records2[z], date: Intl.DateTimeFormat('en-US').format(firstDate) + '-' + Intl.DateTimeFormat('en-US').format(lastDate)})
        actualMonth++
        if(actualMonth > 11) {
          actualMonth = 0
          actualYear++
        }
        if(actualMonth == month + 1 && x==0) {
          x++
        }
        z++
        if(iter == 12) {
          x = 1
        }
        iter++
      }
      recordsData2.push(item2)
      y++
      
      
    }
    const actualDate = new Date()
    const month = actualDate.getMonth()
    let arr1 = months.slice(0, month + 1);
    let arr2 = months.slice(month +1, month + months.length);
    months = arr2.concat(arr1)
    return {recordsData1, recordsData2, months}
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getCountClientsAndSearch = async (string, body) => {
  let initialQuery = 'SELECT COUNT(orden) AS count from lista_clientes'

  let finalQuery = setQuery(string, body, initialQuery, null)

  await sql.connect(sqlConfig)

  const result = await sql.query(finalQuery)
  let count = 0
  if(result.recordset[1]){
    count  = result.recordset[1].count
  } else {
    count  = result.recordset[0].count
  }
  
  return count
}
const getCompanies = async (table) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT * FROM maorigen`)
    const records = result.recordset

    return records
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }

}
const searchWithTable = async (table) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT * FROM ${table}`)
    const records = result.recordset

    return records
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }

}
const getSystemData = async (table) => {
  try {
    let fields = {id:'',email:'',telefono:'',nacimiento:''}
    if(table == 'maclientes') {
      fields.id = 'id'; fields.email = 'xcorreo1', fields.telefono = 'xtelefono1', fields.nacimiento = 'fnacimiento'
    } else if( table == 'clcliente'){
      fields.id = 'ccliente'; fields.email = 'xemail', fields.telefono = 'xtelefono', fields.nacimiento = 'fnacimiento'
    } else if(table == 'Clientes_ManMar') {
      fields.id = 'id'; fields.email = 'xcorreo', fields.telefono = 'xtelefono1', fields.nacimiento = 'fnacimiento'
    } else if(table == 'Clientes_BeeInsurance') {
      fields.id = 'id'; fields.email = 'xcorreo', fields.telefono = 'xtelefono1', fields.nacimiento = 'fnacimiento'
    } else if(table == 'Clientes_Pasarela') {
      fields.id = 'id_buy'; fields.email = 'xcorreo', fields.telefono = 'xtelefono1', fields.nacimiento = 'fnacimiento'
    } else if(table == 'Clientes_RMS') {
      fields.id = 'id'; fields.email = 'xcorreo', fields.telefono = 'xtelefono1', fields.nacimiento = 'fnacimiento'
    }
    let query = `
      SELECT xnombre = 'Sin Correo', COUNT(${fields.id}) as ntotal FROM ${table} WHERE ${fields.email} IS NULL UNION 
      SELECT xnombre = 'Sin Telefono', COUNT(${fields.id}) as ntotal FROM ${table} WHERE ${fields.telefono} IS NULL UNION
      SELECT xnombre = 'Sin Fecha de Nacimiento', COUNT(${fields.id}) as ntotal FROM ${table} WHERE ${fields.nacimiento} IS NULL UNION
      SELECT xnombre = 'Total', COUNT(${fields.id}) as ntotal FROM ${table}
    `
    await sql.connect(sqlConfig)
    const result = await sql.query(query)
    const records = result.recordset

    return records
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }

}
const getAllClientsAndSearch = async (page, string, body) => {
  try {

    const offsetRows = (page * 10) - 10
    const queryRowsA = queryRows(offsetRows)

    let initialQuery = 'SELECT orden, cid, xnombre, corigen, xorigen, fnacimiento, xtelefono1, xcompania, xcedula FROM lista_clientes'

    let finalQuery = setQuery(string, body, initialQuery, queryRowsA)
    // make sure that any items are correctly URL encoded in the connection string    
    
    await sql.connect(sqlConfig)
    const result = await sql.query(`${finalQuery} ${queryRowsA}`)
    const records = result.recordsets[0]

    return {records, query: finalQuery}
    
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}

const setQuery = (string, body, initialQuery) => {

  const bodyKeys = Object.keys(body)

    
  let queryFilters = ''
  let x = 0
  if(bodyKeys.length > 0) {
    for (const key of bodyKeys) {
      if(x > 0) {
        queryFilters += ' AND '
      } else {
        queryFilters += ' WHERE '
      }
      let filterItems = []
      if(key[0].includes('f')){
        const value_splitted = body[key].split(' - ')
        let date1, date2 = ''
        if(value_splitted.length == 1) {
          date1 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
          if(value_splitted[0].includes('>')) {
            queryFilters += `(lista_clientes.${key} <= '${date1}')`
          } else {
            queryFilters += `(lista_clientes.${key} >= '${date1}')`
          }
        } else {
          date2 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
          date1 = moment(new Date(value_splitted[1])).format('MM-DD-YYYY');
          if(value_splitted[0].includes('>')) {
            queryFilters += `(lista_clientes.${key} >= '${date1}')`
          } else if(value_splitted[1].includes('>')) {
            queryFilters += `(lista_clientes.${key} <= '${date2}')`
          } else {
            queryFilters += `(lista_clientes.${key} <= '${date2}' AND lista_clientes.${key} >= '${date1}')`
          }
        }
      } else if(key.includes('_')){
        queryFilters += `xcedula NOT IN (SELECT id FROM maVclientes_productos WHERE cramo = ${body[key]})`
      } else{
        queryFilters += `lista_clientes.${key} = ${body[key]}`
      }
      x++
      if(x == bodyKeys.length && string != '------') {
        queryFilters += ' AND '
      }
      clientsData = filterItems
    }
  }


  let queryString =''
  if (string != '------'){
    if(bodyKeys.length == 0) {
      queryFilters += ' WHERE '
    }
    queryString = `(xcedula LIKE '${string}' + '%' OR xnombre LIKE '${string}' + '%' OR fnacimiento LIKE '${string}' + '%' OR xtelefono1 LIKE '${string}' + '%' OR xcompania LIKE '${string}' + '%')`
  }

  
  let finalQuery = `${initialQuery} ${queryFilters} ${queryString}`
  
  return finalQuery
}
const getClients = async (page) => {
  
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig)
    const offsetRows = (page * 10) - 10
    const result = await getAllClients(offsetRows)
    return result
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}
const countClients = async () => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT COUNT(orden) AS count from lista_clientes`)
    const resutlR = result.recordsets[0][0].count
    return resutlR
  } catch (err) {
    console.log('Error al Obtener el total de los clientes', err)
    return err
  }
}

const getProducts = async (rif) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const query = `SELECT * FROM maVclientes_productos WHERE id = '${rif}'`;
   const result = await sql.query(query)
   
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los productos del cliente', err)
   return err
  }
}
const getObservations = async (orden) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const query = `SELECT * FROM clV_Observaciones WHERE orden = ${orden}`;
   const result = await sql.query(query)
   
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener las observaciones del cliente', err)
   return err
  }
}

const getReceipts = async (cnpoliza) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT xrecibo, mmonto_ext, xcontrato, fdesde, iestadorec FROM recibos_all WHERE xcontrato = ${cnpoliza}`
   
   
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los recibos de los productos', err)
   return err
  }
}
const addObservation = async (orden, data) => {
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   let date = new Date
   date = date.toLocaleDateString('en-US')
   const query = `INSERT into clobservaciones (orden, fobservacion, cusuario, xobservacion, itipoobservacion, cestatus) VALUES (${orden},'${date}', ${data.cusuario}, '${data.xobservacion}', '${data.itipoobservacion}', ${data.cestatus})`
   const result = await sql.query(query)
   
  //  await sql.close()
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al agregar la Observacion', err)
   return err
  }
}
export default {
  getClients,
  addObservation,
  countClients,
  searchWithTable,
  getAllClientsAndSearch,
  getCountClientsAndSearch,
  getAllClients,
  getClientData,
  getProducts,
  getObservations,
  getDashboardClientData,
  getReceipts,
  setAllClients,
  getCompanies,
  getSystemData
}
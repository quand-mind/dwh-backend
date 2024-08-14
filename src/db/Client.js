import sql from 'mssql'
import moment from 'moment';

let clientsData = []
let allClients = []
let countAllClients = 0

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
    if(!countAllClients) {
      await sql.connect(sqlConfig)
      const result = await sql.query`SELECT COUNT(orden) AS count from lista_clientes`
      countAllClients = result.recordsets[0][0].count
    }
    return countAllClients
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getAllClients = async (firstItem) => {
  
  try {
    let total = 0
    // make sure that any items are correctly URL encoded in the connection string
    // if(allClients.length <= firstItem) {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT cid, xnombre, corigen, xorigen, fnacimiento, orden, xtelefono1, xcompania, xcedula FROM lista_clientes ORDER BY orden OFFSET ${parseInt(firstItem)} ROWS FETCH NEXT 10 ROWS ONLY`
    
    const records = result.recordsets[0]
    
    return records
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getClientData = async (cedula) => {
  
  try {
    clientsData = []
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * FROM lista_clientes WHERE xcedula = ${cedula}`

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
  
  const index = clientsData.findIndex(item2=> item2.xcedula == item.xcedula)
  const ccorigen = item.corigen
  const xxorigen = item.xorigen
  item.corigen = []
  item.xorigen = []
  
  if(index == -1) {
    item.corigen.push(ccorigen)
    item.xorigen.push(xxorigen)
    clientsData.push(item)
  } else {
    const entries = Object.entries(clientsData[index])
    const entries2 = Object.entries(item)
    let y = 0
    for (const element of entries) {
      if(!element[1]){
        element[1] = entries2[y][1]
        clientsData[index][element[0]] = entries2[y][1]
        const originIndex = clientsData[index].corigen.findIndex(origin => origin == ccorigen)
        if(originIndex == -1) {
          clientsData[index].corigen.push(ccorigen)
          clientsData[index].xorigen.push(xxorigen)
        }
      }
      y++
    }
  }
}
const getDashboardClientData = async () => {
  
  try {
    const objectItems = [
      {label: 'Sys2000', value: 1, color: '#000000'},
      {label: 'ArysAuto', value: 2, color: '#fdb101'},
      {label: 'ManMar', value: 3, color: '#334ebd'},
      {label: 'Beeinsurance', value: 4, color: '#F1B592'},
      {label: 'Pasarela de Ventas', value: 5, color: '#4A80F4'},
      {label: 'Logistika', value: 6, color: '#FF794B'}
    ]
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig)
    // const result = await sql.query`SELECT * FROM maVclientes_all`
    
    
    // const records = result.recordsets[0]
    let records1 = []
    let records2 = []
    let recordsData1 = []
    let recordsData2 = []
    let months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    let queryItems1 = ''
    let queryItems2 = ''

    let z = 1
    for(const objectItem of objectItems) {
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
      while (x == 0) {
        let lastDate = moment(new Date(actualYear, actualMonth + 1, 0)).format('MM-DD-YYYY');
        let firstDate = moment(new Date(actualYear, actualMonth, 0)).format('MM-DD-YYYY');

        queryItems2 += `SUM(CASE When corigen = ${objectItem.value} AND fcreacion >= '${firstDate}' AND fcreacion <= '${lastDate}' Then 1 Else 0 End)`

        actualMonth++
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
      }
      z++
    }
    
    const query1 = `SELECT ${queryItems1} FROM lista_clientes`
    const query2 = `SELECT ${queryItems2} FROM lista_clientes`
    
    
    let result1 = await sql.query(query1)
    records1 = result1.recordset[0]['']
    
    let result2 = await sql.query(query2)
    records2 = result2.recordset[0]['']
    console.log(records2);

    let y = 0
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

      let z = 0

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
const getAllClientsAndSearch = async (string, body) => {
  try {
    // make sure that any items are correctly URL encoded in the connection string
    clientsData = await allClients
    if (string != '------'){
     clientsData = []
      for (const item of allClients) {
        const keys = Object.keys(item)
        const values = Object.values(item)
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
    if(bodyKeys.length > 0) {
      for (const key of bodyKeys) {
        
        let filterItems = []
        if(key[0].includes('f')){
          const value_splitted = body[key].split(' - ')
          let date1 = new Date(value_splitted[0]);
          let date2 = new Date(value_splitted[1]);
          filterItems = clientsData.filter(item => item[key] > date1 && item[key] < date2 )
        } else if(key.includes('cid')) {
          const clientsProducts = await getProductsByType(body[key])
          const arrayClients = []
          for( const product of await clientsProducts) {
            const validClient = clientsData.find(item => item.cid == product.cci_rif)
            if(validClient) {
              if(!arrayClients.find(item=> item.cid == product.cci_rif)){
                arrayClients.push({...validClient})
              }
            }
          }
          filterItems = arrayClients
        } else if(key.includes('_')){
          const clientsProducts = await getProductsByType(body[key])
          const arrayClients = []
          for( const product of await clientsProducts) {
            const validClient = clientsData.find(item => item.cid == product.cci_rif)
            if(validClient) {
              if(!arrayClients.find(item=> item.cid == product.cci_rif)){
                filterItems.push({...validClient})
                arrayClients.push({...validClient})
              }
            }
          }
        } else{
          filterItems = clientsData.filter(item => item[key] == body[key])
        }
        clientsData = filterItems
        clientsData.sort(compareByCode)
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
   const result = await sql.query(`SELECT * FROM maVclientes_productos WHERE cci_rif = '${rif}'`)
   
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los productos de los clientes', err)
   return err
  }
}

const getReceipts = async (cnpoliza) => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT cnrecibo, mmontoapagext, cnpoliza, femision, fanopol, itipopol, fanulacion, fcobro, iestadorec FROM adrecibos WHERE cnpoliza = ${cnpoliza}`
   
   return result.recordsets[0]
  } catch (err) {
   console.log('Error al Obtener los productos de los clientes', err)
   return err
  }
}

const getProductsByType = async (ramo) => {
  
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
  getClientData,
  getProducts,
  getDashboardClientData,
  getReceipts,
  setAllClients
}
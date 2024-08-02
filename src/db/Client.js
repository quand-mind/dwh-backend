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

function compareByCode( a, b ) {
  if ( a.id < b.id ){
    return -1;
  }
  if ( a.id > b.id ){
    return 1;
  }
  return 0;
}

const getAllClients = async () => {
  
  try {
   // make sure that any items are correctly URL encoded in the connection string
   await sql.connect(sqlConfig)
   const result = await sql.query`SELECT * FROM maVclientes_all`
   
   const records = result.recordsets[0]
   clientsData = []
   for (const record of records){
    clientsData.push(record)
   }
   
   allClients = [...clientsData]
   clientsData.sort(compareByCode)
   return clientsData
  } catch (err) {
   console.log('Error al Obtener los clientes', err)
   return err
  }
}
const getDashboardClientData = async () => {
  
  try {
    const objectItems = [
      {label: 'Sys2000', value: 1, color: '#000000'},
      {label: 'ManMar', value: 3, color: '#334ebd'},
      {label: 'ArysAuto', value: 2, color: '#fdb101'},
      // {label: 'Beeinsurance', value: 10, color: '#F1B592'}
    ]
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * FROM maVclientes_all`
    
    
    const records = result.recordsets[0]
    let recordsData1 = []
    let recordsData2 = []
    let months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    for(const objectItem of objectItems) {
      let actualDate = new Date()
      const year = actualDate.getFullYear()
      let month = actualDate.getMonth()
      
      let sysData = records.filter(item => {
        if(item.corigen == objectItem.value) {
          return item
        }
      })
      let monthData = null
      
      let actualMonth = month +1
      let actualYear = year - 1
      let x = 0
      let item1 = {}
      let item2 = {}

      item1.color = objectItem.color
      item1.data = sysData.length
      item1.label = objectItem.label

      recordsData1.push(item1)

      item2.color = objectItem.color
      item2.data = []
      item2.label = objectItem.label

      while (x == 0) {
        let lastDate = new Date(actualYear, actualMonth + 1, 0);
        let firstDate = new Date(actualYear, actualMonth, 0);
        monthData = sysData.filter(item => {
          if(item) {
            const dateItem = new Date(item.fcreacion)
            if(dateItem > firstDate && dateItem <= lastDate) {
              return item
            }
          }
        })
        item2.data.push({label: months[actualMonth], data: monthData.length, date: Intl.DateTimeFormat('en-US').format(firstDate) + '-' + Intl.DateTimeFormat('en-US').format(lastDate)})
        actualMonth++
        if(actualMonth > 11) {
          actualMonth = 0
          actualYear++
        }
        if(actualMonth == month + 1 && x==0) {
          x++
        }
      }
      recordsData2.push(item2)
      
      
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
  //  const result = await sql.query`SELECT * FROM maclientes ORDER BY id OFFSET ${parseInt(offsetRows)} rows FETCH NEXT 10 rows ONLY`
  let result = []
  const clients = await clientsData
  if(clients.length > 0) {
    result = clients.slice(offsetRows, page * 10 )
  }
  
  result.sort(compareByCode)
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
   const result = await sql.query(`SELECT * FROM maVclientes_productos WHERE cci_rif = ${parseInt(rif)}`)
   
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
  getProducts,
  getDashboardClientData,
  getReceipts
}
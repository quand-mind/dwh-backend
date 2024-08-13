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

const setAllClients = async () => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT COUNT(orden) AS count from lista_clientes`
    return result.recordsets[0][0].count
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getAllClients = async (firstItem) => {
  
  try {
    let total = 0
    // make sure that any items are correctly URL encoded in the connection string
    if(allClients.length <= 0) {
      await sql.connect(sqlConfig)
      const result = await sql.query`SELECT * FROM lista_clientes ORDER BY orden OFFSET ${parseInt(firstItem)} ROWS FETCH NEXT 10000 ROWS ONLY`
      
      const records = result.recordsets[0]
      records.forEach(item => {
        formatData(item)
      })
     
      allClients = [...clientsData]
      total = await records.length
      console.log(clientsData.length);
    }
    return {clientsData: clientsData.length, total: total}
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
      // {label: 'ManMar', value: 3, color: '#334ebd'},
      {label: 'ArysAuto', value: 2, color: '#fdb101'},
      {label: 'Pasarela de Ventas', value: 5, color: '#4A80F4'},
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
  getProducts,
  getDashboardClientData,
  getReceipts,
  setAllClients
}
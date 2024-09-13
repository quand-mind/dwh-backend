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

const getGraphicsById = async (id) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * from magraficos WHERE corigen = ${id}`
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const setBg = () => {
  const randomColor = Math.floor(Math.random()*16777215).toString(16);
  return "#" + randomColor;
}

const getItems = async (queryItems, queryTotal) => {
  try {
    await sql.connect(sqlConfig)
    const result = []
    let total = 0
    const items = await sql.query(`${queryItems}`)
    const valuesToSearch = items.recordset
    let x = 0
    for (const value of valuesToSearch) {
      let newQueryTotal = queryTotal.split('@var')
      if(value.value) { 
        newQueryTotal.splice(newQueryTotal.length-1, 0, `'${value.value}'`)
        newQueryTotal = newQueryTotal.join('')
      } else {
        value.label = 'No especificado'
        newQueryTotal = newQueryTotal.join('')
        newQueryTotal = newQueryTotal.split('=')
        newQueryTotal.splice(newQueryTotal.length-1, 0, `IS NULL`)
        newQueryTotal = newQueryTotal.join('')
      }
      const values = await sql.query(`${newQueryTotal}`)
      const valueF = values.recordset[0].value
      result.push({color: setBg(), data: valueF, label: value.label})
      total += valueF
      x++
    }
    return {data: result, total: total}
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const getItemsFiltered = async (filters, queryItems, queryTotal) => {
  try {
    console.log(filters);
    await sql.connect(sqlConfig)
    const result = []
    let total = 0
    const items = await sql.query(`${queryItems}`)
    const valuesToSearch = items.recordset
    let x = 0
    if(filters.main){
      let newQueryTotal = queryTotal.split('@var')
      const labelToFind = valuesToSearch.find((element) => element.value == filters.main)
      if(labelToFind) {
        newQueryTotal.splice(newQueryTotal.length-1, 0, `'${filters.main}'`)
        newQueryTotal = newQueryTotal.join('')
        const values = await sql.query(`${newQueryTotal}`)
        const valueF = values.recordset[0].value
        result.push({color: setBg(), data: valueF, label: labelToFind.label})
        total += valueF
      }
    } else {

      for (const value of valuesToSearch) {
        let newQueryTotal = queryTotal.split('@var')
        if(value.value) { 
          newQueryTotal.splice(newQueryTotal.length-1, 0, `'${value.value}'`)
          newQueryTotal = newQueryTotal.join('')
        } else {
          value.label = 'No especificado'
          newQueryTotal = newQueryTotal.join('')
          newQueryTotal = newQueryTotal.split('=')
          newQueryTotal.splice(newQueryTotal.length-1, 0, `IS NULL`)
          newQueryTotal = newQueryTotal.join('')
        }
        const values = await sql.query(`${newQueryTotal}`)
        const valueF = values.recordset[0].value
        result.push({color: setBg(), data: valueF, label: value.label})
        total += valueF
        x++
      }
    }
    return {data: result, total: total}
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}

const setQuery = (body, initialQuery) => {

  const bodyKeys = Object.keys(body)

    
  let queryFilters = ''
  let x = 0
  if(bodyKeys.length > 0) {
    for (const key of bodyKeys) {
      queryFilters += ' AND '
      if(key[0].includes('f')){
        const value_splitted = body[key].split(' - ')
        let date1, date2 = ''
        if(value_splitted.length == 1) {
          date1 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
          if(value_splitted[0].includes('>')) {
            queryFilters += `(${key} <= '${date1}')`
          } else {
            queryFilters += `(${key} >= '${date1}')`
          }
        } else {
          date2 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
          date1 = moment(new Date(value_splitted[1])).format('MM-DD-YYYY');
          if(value_splitted[0].includes('>')) {
            queryFilters += `(${key} >= '${date1}')`
          } else if(value_splitted[1].includes('>')) {
            queryFilters += `(${key} <= '${date2}')`
          } else {
            queryFilters += `(${key} <= '${date2}' AND ${key} >= '${date1}')`
          }
        }
      } else if(key.includes('_')){
        queryFilters += `xcedula NOT IN (SELECT id FROM maVclientes_productos WHERE cramo = ${body[key]})`
      } else{
        queryFilters += `${key} = ${body[key]}`
      }
      x++
    }
  }

  
  let finalQuery = `${initialQuery} ${queryFilters}`
  
  return finalQuery
}

export default {
  getGraphicsById,
  getItems,
  getItemsFiltered
}
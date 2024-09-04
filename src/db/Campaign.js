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

const setQuery = (body, initialQuery) => {

  const bodyKeys = Object.keys(body)

    
  let queryFilters = ''
  let x = 0
  if(bodyKeys.length > 0) {
    for (const key of bodyKeys) {
      queryFilters += ' AND '
      if(key[0].includes('f')){
        const value_splitted = body[key].split(' - ')
        console.log(value_splitted.length);
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

const getClientsProduct = async (corigen, cramo, data) => {
  try {
    const initialQuery = `SELECT orden, xnombre, cid FROM lista_clientes WHERE xcedula NOT IN (SELECT id FROM maVclientes_productos WHERE cramo = ${cramo}) AND corigen = ${corigen}`
    let finalQuery = setQuery(data, initialQuery, null)
    console.log(finalQuery);
    await sql.connect(sqlConfig)
    const result = await sql.query(finalQuery)
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
  
}
const getClientsData = async (data) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`
      SELECT * FROM lista_clientes WHERE orden IN (${data.join(',')}) `)
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
  getClientsData,
  getProductsPlan,
}
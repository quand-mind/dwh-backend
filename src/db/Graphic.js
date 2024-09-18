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
    let data = []
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
    data.push({data: result, total: total})
    return {data: data}
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const getItemsFiltered = async (filters, queryItems, queryTotal) => {
  try {
    await sql.connect(sqlConfig)
    let result = []
    let data = []
    let result2 = []
    let resultsApart = []
    let total = 0
    const items = await sql.query(`${queryItems}`)
    const valuesToSearch = items.recordset
    let varQueryArr = queryTotal.split('count(')
    let varQuery = varQueryArr[1].split(')')[0]
    if(filters.main){
      let newQueryTotal = queryTotal.split('@var')
      const labelToFind = valuesToSearch.find((element) => element.value == filters.main)
      if(labelToFind) {
        newQueryTotal.splice(newQueryTotal.length-1, 0, `'${filters.main}'`)
        newQueryTotal = newQueryTotal.join('')
        // console.log(newQueryTotal);
        delete filters.main
        const bodyKeys = Object.keys(filters)
        const values = await sql.query(`${newQueryTotal}`)
        const valueF = values.recordset[0].value
        for (const key of bodyKeys) {
          
          let finalQuery = setQuery(key, filters[key], newQueryTotal,varQuery)
          if(finalQuery.trim() != newQueryTotal.trim()){
            let valueF2 = values.recordset[0].value
            const values2 = await sql.query(`${finalQuery}`)
            valueF2 = values2.recordset[0].value
            result2.push({color: setBg(), data: valueF2, label: labelToFind.label})
            resultsApart.push({result:result2, label: `${filters[key]}`})
          }
        }
        result.push({color: setBg(), data: valueF, label: labelToFind.label})
        total += valueF
        data.push({data: result, total: total})
        if(resultsApart.length > 0) {
          resultsApart.forEach(result2A => {
            data.push({data: result2A.result, total: total, label: result2A.label})        
          });
        }
      }
    } else {
      result = []
      result2 = []
      resultsApart = []
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
        let valueF = values.recordset[0].value
        const bodyKeys = Object.keys(filters)
        for (const key of bodyKeys) {
          let finalQuery = setQuery(key, filters[key], newQueryTotal, varQuery)
          
          // console.log(finalQuery.trim() == newQueryTotal.trim());
          // console.log(newQueryTotal);
          if(finalQuery.trim() != newQueryTotal.trim()){
            let valueF2 = values.recordset[0].value
            const values2 = await sql.query(`${finalQuery}`)
            valueF2 = values2.recordset[0].value
            result2.push({color: setBg(), data: valueF2, label: `${filters[key]}`})
          }
          if(x == valuesToSearch.length > 1) {
            resultsApart.push({result:result2, label: `${filters[key]}`})
          }
        }
        result.push({color: setBg(), data: valueF, label: value.label})
        total += valueF
        x++
      }
      data.push({data: result, total: total})
      if(resultsApart.length > 0) {
        resultsApart.forEach(result2A => {
          data.push({data: result2A.result, total: total, label: result2A.label})   
        });
        
      }
    }
    return {data:data}
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}

const getFilters = async (id) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * from mafiltros WHERE cgrafico = ${parseInt(id)}`
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}

const setQuery = (key, value, initialQuery, mainVar) => {

  // const bodyKeys = Object.keys(body)

    
  let queryFilters = ''
    // for (const key of bodyKeys) {
  queryFilters += ' AND '
  if(key[0].includes('f')){
    const value_splitted = value.split(' - ')
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
    const keySplit = key.split('_')
    let keyFilter = ''
    if(keySplit[1].includes('f')){
      const value_splitted = value.split(' - ')
      let date1, date2 = ''
      if(value_splitted.length == 1) {
        date1 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
        if(value_splitted[0].includes('>')) {
          keyFilter = `(${keySplit[1]} <= '${date1}')`
        } else {
          keyFilter = `(${keySplit[1]} >= '${date1}')`
        }
      } else {
        date2 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
        date1 = moment(new Date(value_splitted[1])).format('MM-DD-YYYY');
        if(value_splitted[0].includes('>')) {
          keyFilter += `(${keySplit[1]} >= '${date1}')`
        } else if(value_splitted[1].includes('>')) {
          keyFilter = `(${keySplit[1]} <= '${date2}')`
        } else {
          keyFilter = `(${keySplit[1]} <= '${date2}' AND ${keySplit[1]} >= '${date1}')`
        }
      }
    } else {
      keyFilter =`${keySplit[1]} = ${value}`
    }
    queryFilters += `${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
  } else{
    queryFilters += `${key} = ${value}`
  }  
  let finalQuery = `${initialQuery} ${queryFilters}`
  
  return finalQuery
}

const getDetails = async (id, filter, requestVar) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT * from magraficos WHERE id = ${parseInt(id)}`)
    const graphic = result.recordset[0]
    let response = null
    if(graphic) {
      const sqlArr = graphic.xsqltotales.split('from')
      console.log(sqlArr);
    }
    return graphic
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}

export default {
  getGraphicsById,
  getItems,
  getItemsFiltered,
  getFilters,
  getDetails
}
import sql from 'mssql'
import moment from 'moment';
import { col } from 'sequelize';

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

const getGraphicCompanies = async () => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * from maorigen WHERE igraficos = 1`
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getGraphicsById = async (id) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * from magraficos WHERE corigen = ${id} and bactivo = 1`
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

const getItems = async (id) => {
  try {
    await sql.connect(sqlConfig)
    const result = []
    let data = []
    let total = 0
    const graph = await sql.query(`select * from magraficos where id = ${id}`)
    let queryItems = graph.recordset[0].xsqlitems
    let queryTotal = graph.recordset[0].xsqltotales
    if(graph.recordset.type == 'line') {
      const items = await sql.query(`${queryItems}`)
    } else {

      if(graph.recordset[0].xvalordefecto) {
        const defaultValue = await sql.query(graph.recordset[0].xvalordefecto)
        queryTotal = queryTotal.replaceAll('@2var', `'${defaultValue.recordset[0].default_value}'`)
      }
      const items = await sql.query(`${queryItems}`)
      const valuesToSearch = items.recordset
      let x = 0
      const variables = await sql.query(`select* from mavaloresgraficos where cgrafico = ${id}`)
      for (const value of valuesToSearch) {
        let newQueryTotal = ''
        if(value.value) { 
          newQueryTotal = queryTotal.replaceAll('@var', `'${value.value}'`)
        } else {
          value.label = 'No especificado'
          newQueryTotal = queryTotal.replaceAll('=@var', `'IS NULL'`)
        }
        for (const variable of variables.recordset) {
          newQueryTotal = newQueryTotal.replaceAll(variable.xidentificador, variable.xllavevalor)
        }
        const values = await sql.query(`${newQueryTotal}`)
        const valueF = values.recordset[0].value
        result.push({color: setBg(), data: valueF, label: value.label, id: value.value})
        total += valueF
        x++
      }
    }
    data.push({data: result, total: total})
    return {data: data}
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const getItemsFiltered = async (filters, filtersInvert, id) => {
  try {
    await sql.connect(sqlConfig)
    let result = []
    let data = []
    let resultsApart = []
    let total = 0

    const graph = await sql.query(`select * from magraficos where id = ${id}`)
    let queryItems = graph.recordset[0].xsqlitems
    let queryTotal = graph.recordset[0].xsqltotales
    let type = graph.recordset[0].xtipografico

    let defaultValue = null
    if(graph.recordset[0].xvalordefecto) {
      defaultValue = await sql.query(graph.recordset[0].xvalordefecto)
      queryTotal = queryTotal.replaceAll('@2var', `'${defaultValue.recordset[0].default_value}'`)
    }
    
    const items = await sql.query(`${queryItems}`)
    const valuesToSearch = items.recordset
    let varQueryArr = queryTotal.split('count(')
    let varQuery = varQueryArr[1].split(')')[0]
    
    const variables = await sql.query(`select* from mavaloresgraficos where cgrafico = ${id}`)
    const bodyEntries = Object.entries(filters)
    if(type == 'bar') {
      if(filters.main){
        const labelToFind = valuesToSearch.find((element) => element.value == filters.main)
        if(labelToFind) {
          let newQueryTotal = queryTotal.replaceAll('@var',`'${filters.main}'`)
          delete filters.main
          const bodyKeys = Object.keys(filters)
          const values = await sql.query(`${newQueryTotal}`)
          const valueF = values.recordset[0].value
          let x = 0
          for (const key of bodyKeys) {
            let result2 = []
            
            
            let finalQuery = setQuery(key, filters[key], newQueryTotal,varQuery)
            if(finalQuery.trim() != newQueryTotal.trim()){
              let valueF2 = values.recordset[0].value
              const values2 = await sql.query(`${finalQuery}`)
              valueF2 = values2.recordset[0].value
              result2.push({color: setBg(), data: valueF2, label: labelToFind.label, id: labelToFind.value})
              resultsApart.push({result:result2, label: `${filters[key]}`})
            }
          }
          result.push({color: setBg(), data: valueF, label: labelToFind.label, id: labelToFind.value})
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
        resultsApart = []
        let x = 0
        let result2 = []
        for (const value of valuesToSearch) {
          
          let newQueryTotal = queryTotal
          if(value.value) { 
            newQueryTotal = queryTotal.replaceAll('@var', `'${value.value}'`)
          } else {
            value.label = 'No especificado'
            newQueryTotal = newQueryTotal.replaceAll('=@var', `IS NULL`)
          }
          const values = await sql.query(`${newQueryTotal}`)
          let valueF = values.recordset[0].value
          const bodyKeys = Object.keys(filters)
          for (const key of bodyKeys) {
            let finalQuery = setQuery(key, filters[key], newQueryTotal, varQuery)
            // if(finalQuery.trim() != newQueryTotal.trim()){
            let valueF2 = values.recordset[0].value
            const values2 = await sql.query(`${finalQuery}`)
            valueF2 = values2.recordset[0].value
            result2.push({color: setBg(), data: valueF2, label: `${filters[key]}`, id: value.value})
            // }
            if(x == valuesToSearch.length > 1) {
              resultsApart.push({result:result2, label: `${filters[key]}`})
            }
          }
          x++
          
          result.push({color: setBg(), data: valueF, label: value.label, id: value.value})
          total += valueF
        }
        data.push({data: result, total: total})
        if(resultsApart.length > 0) {
          resultsApart.forEach(result2A => {
            data.push({data: result2A.result, total: total, label: result2A.label})   
          });
          
        }
      }
    } else {
      result = []
      let x = 0
      for (const value of valuesToSearch) {
        let newQueryTotal = ''
        if(value.value) { 
          newQueryTotal = queryTotal.replaceAll('@var', `'${value.value}'`)
        } else {
          value.label = 'No especificado'
          newQueryTotal = queryTotal.replaceAll('=@var', `'IS NULL'`)
        }
        for (const variable of variables.recordset) {
          const keyIndex = bodyEntries.findIndex(key=> key[0] = variable.xllave)
          if(keyIndex != -1) {
            newQueryTotal = newQueryTotal.replaceAll(variable.xidentificador, `'${bodyEntries[keyIndex][1]}'`)
          } else {
            newQueryTotal = newQueryTotal.replaceAll(variable.xidentificador, `'${variable.xllavevalor}'`)
          }
        }
        let finalQuery = setQueryArray(filters, filtersInvert, newQueryTotal, varQuery)
        const values2 = await sql.query(`${finalQuery}`)
        let valueF2 = values2.recordset[0].value
        total += valueF2
        result.push({color: setBg(), data: valueF2, label: value.label, id: value.value})
        x++
      }
      data.push({data: result, total: total})
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

const setQuery = (key, value, initialQuery, mainVar, grouped) => {
  // console.log(grouped);

  // const bodyKeys = Object.keys(body)

  let queryFilters = ''
    // for (const key of bodyKeys) {
  queryFilters += ' AND '
  if(key[0].includes('f')){
    if(grouped) {
      key = grouped + key 
    }
    const value_splitted = value.split(' - ')
    let date1, date2 = ''
    if(value_splitted.length == 1) {
      date1 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
      const dateNow = moment(new Date()).format('MM-DD-YYYY');
      // console.log(value_splitted)
      
      if(value_splitted[0].includes('>')) {
        queryFilters += `(convert(date,${key}) <= '${date1}')`
      } else if(value_splitted[0].includes('<')){
        queryFilters += `(convert(date,${key}) >= '${date1}')`
      } else {
        if(date1 > dateNow) {
          queryFilters += `(convert(date,${key}) <= '${date1}')`
        } else {
          queryFilters += `(convert(date,${key}) >= '${date1}')`
        }
      }
    } else {
      date2 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
      date1 = moment(new Date(value_splitted[1])).format('MM-DD-YYYY');
      if(value_splitted[0].includes('>')) {
        queryFilters += `(convert(date,${key}) >= '${date1}')`
      } else if(value_splitted[1].includes('>')) {
        queryFilters += `(convert(date,${key}) <= '${date2}')`
      } else if(value_splitted[0].includes('<')) {
        queryFilters += `(convert(date,${key}) <= '${date1}')`
      } else if(value_splitted[1].includes('<')){
        queryFilters += `(convert(date,${key}) >= '${date2}')`
      } else {
        if(date2 > date1) {
          queryFilters += `(convert(date,${key}) between '${date1}' AND '${date2}')`
        } else {
          queryFilters += `(convert(date,${key}) between '${date2}' AND '${date1}')`

        }
      }
    }
  } else if(key.includes('/?/')){
    const keySplit = key.split('/?/')
    let keyFilter = ''
    if(keySplit[1].includes('f')){
      const value_splitted = value.split(' - ')
      let date1, date2 = ''
      if(value_splitted.length == 1) {
        date1 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
        const dateNow = moment(new Date()).format('MM-DD-YYYY');

        if(value_splitted[0].includes('>')) {
          keyFilter = `(convert(date,${keySplit[1]}) <= '${date1}')`
        } else if(value_splitted[0].includes('<')){
          keyFilter = `(convert(date,${keySplit[1]}) >= '${date1}')`
        } else {
          if(date1 > dateNow) {
            keyFilter += `(convert(date,${keySplit[1]}) <= '${date1}')`
          } else {
            keyFilter += `(convert(date,${keySplit[1]}) >= '${date1}')`
          }
        }
      } else {
        date2 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
        date1 = moment(new Date(value_splitted[1])).format('MM-DD-YYYY');
        if(value_splitted[0].includes('>')) {
          keyFilter += `(${keySplit[1]} >= '${date1}')`
        } else if(value_splitted[1].includes('>')) {
          keyFilter = `(${keySplit[1]} <= '${date2}')`
        } else if(value_splitted[0].includes('<')) {
          keyFilter += `(${keySplit[1]} <= '${date1}')`
        } else if(value_splitted[1].includes('<')){
          keyFilter += `(${keySplit[1]} >= '${date2}')`
        } else {
          if(date2 > date1) {
            keyFilter += `(convert(date,${keySplit[1]}) between '${date1}' AND '${date2}')`
          } else {
            keyFilter += `(convert(date,${keySplit[1]}) between '${date2}' AND '${date1}')`
          }
        }
      }
    } else {
      keyFilter =`${keySplit[1]} = ${value}`
    }
    if(grouped) {
      queryFilters += `${grouped}${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
    } else {
      queryFilters += `${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
    }
  } else{
    queryFilters += `${key} = ${value}`
  }  
  let finalQuery = `${initialQuery} ${queryFilters}`
  
  return finalQuery
}
const setQueryArray = (filters, filtersInvert, initialQuery, mainVar, grouped) => {

  const bodyKeys = Object.keys(filters)
    
  let queryFilters = ''
  let x = 0
  if(bodyKeys.length > 0) {
    queryFilters += ' AND '
    for (let key of bodyKeys) {
      if(filtersInvert[x] == null){
        if(key[0].includes('f')){
          let date1 = new Date(filters[key]).toLocaleDateString('en-CA');
          if(grouped) {
            key = grouped + key 
          }
          queryFilters += `(convert(date,${key}) = '${date1}')`
        } else if(key.includes('/?/')){
          const keySplit = key.split('/?/')
          let keyFilter = ''
          if(keySplit[1].includes('f')){
            const value_splitted = value.split(' - ')
            if(value_splitted.length == 1) {
              date1 = new Date(value_splitted[0]).toLocaleDateString('en-CA');
              if(value_splitted[0].includes('>')) {
                keyFilter = `(convert(date,${keySplit[1]}) <= '${date1}')`
              } else {
                keyFilter = `(convert(date,${keySplit[1]}) >= '${date1}')`
              }
            } else {
              date1 = new Date(value_splitted[1]).toLocaleDateString('en-CA');
              keyFilter += `(convert(date,${keySplit[1]}) = '${date1}')`
            }
          } else {
            keyFilter =`convert(date,${keySplit[1]}) = ${value}`
          }
          if(grouped) {
            queryFilters += `${grouped}${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          } else {
            queryFilters += `${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          }
        } else{
          queryFilters += `${key} = ${value}`
        }
      } else {
        if(key[0].includes('f')){
          if(grouped) {
            key = grouped + key 
          }
          const value_splitted = filters[key].split(' - ')
          let date1, date2 = ''
          if(value_splitted.length == 1) {
            date1 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
            const dateNow = moment(new Date()).format('MM-DD-YYYY');
            // console.log(value_splitted)
            
            if(value_splitted[0].includes('>')) {
              queryFilters += `(convert(date,${key}) <= '${date1}')`
            } else if(value_splitted[0].includes('<')){
              queryFilters += `(convert(date,${key}) >= '${date1}')`
            } else {
              if(date1 > dateNow) {
                queryFilters += `(convert(date,${key}) <= '${date1}')`
              } else {
                queryFilters += `(convert(date,${key}) >= '${date1}')`
              }
            }
          } else {
            date2 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
            date1 = moment(new Date(value_splitted[1])).format('MM-DD-YYYY');
            if(value_splitted[0].includes('>')) {
              queryFilters += `(convert(date,${key}) >= '${date1}')`
            } else if(value_splitted[1].includes('>')) {
              queryFilters += `(convert(date,${key}) <= '${date2}')`
            } else if(value_splitted[0].includes('<')) {
              queryFilters += `(convert(date,${key}) <= '${date1}')`
            } else if(value_splitted[1].includes('<')){
              queryFilters += `(convert(date,${key}) >= '${date2}')`
            } else {
              if(date2 > date1) {
                queryFilters += `(convert(date,${key}) between '${date1}' AND '${date2}')`
              } else {
                queryFilters += `(convert(date,${key}) between '${date2}' AND '${date1}')`
  
              }
            }
          }
        } else if(key.includes('/?/')){
          const keySplit = key.split('/?/')
          let keyFilter = ''
          if(keySplit[1].includes('f')){
            const value_splitted = value.split(' - ')
            let date1, date2 = ''
            if(value_splitted.length == 1) {
              date1 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
              if(value_splitted[0].includes('>')) {
                keyFilter = `(convert(date,${keySplit[1]}) <= '${date1}')`
              } else {
                keyFilter = `(convert(date,${keySplit[1]}) >= '${date1}')`
              }
            } else {
              date2 = moment(new Date(value_splitted[0])).format('MM-DD-YYYY');
              date1 = moment(new Date(value_splitted[1])).format('MM-DD-YYYY');
              if(value_splitted[0].includes('>')) {
                keyFilter += `(convert(date,${keySplit[1]}) >= '${date1}')`
              } else if(value_splitted[1].includes('>')) {
                keyFilter = `(convert(date,${keySplit[1]}) <= '${date2}')`
              } else {
                keyFilter = `(convert(date,${keySplit[1]}) between '${date2}' AND '${date1}')`
              }
            }
          } else {
            keyFilter =`convert(date,${keySplit[1]}) = ${value}`
          }
          if(grouped) {
            queryFilters += `${grouped}${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          } else {
            queryFilters += `${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          }
        } else{
          queryFilters += `${key} = ${value}`
        }
      }
      x++
    }
  }
  let finalQuery = `${initialQuery} ${queryFilters}`
  return finalQuery
}
const setQueryArrayTotal = (filters, filtersInvert, initialQuery, mainVar, grouped) => {

  const bodyKeys = Object.keys(filters)
    
  let queryFilters = ''
  let x = 0
  if(bodyKeys.length > 0) {
    queryFilters += ' AND '
    for (let key of bodyKeys) {
      if(filtersInvert[x] == null){
        if(key[0].includes('f')){
          let date1 = filters[key];
          if(grouped) {
            key = grouped + key 
          }
          queryFilters += `(convert(date,${key}) = '${date1}')`
        } else if(key.includes('/?/')){
          const keySplit = key.split('/?/')
          let keyFilter = ''
          if(keySplit[1].includes('f')){
            const value_splitted = value.split(' - ')
            if(value_splitted.length == 1) {
              date1 = value_splitted[0];
              if(value_splitted[0].includes('>')) {
                keyFilter = `(convert(date,${keySplit[1]}) <= '${date1}')`
              } else {
                keyFilter = `(convert(date,${keySplit[1]}) >= '${date1}')`
              }
            } else {
              date1 = value_splitted[1];
              keyFilter += `(convert(date,${keySplit[1]}) = '${date1}')`
            }
          } else {
            keyFilter =`convert(date,${keySplit[1]}) = ${value}`
          }
          if(grouped) {
            queryFilters += `${grouped}${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          } else {
            queryFilters += `${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          }
        } else{
          queryFilters += `${key} = ${value}`
        }
      } else {
        if(key[0].includes('f')){
          if(grouped) {
            key = grouped + key 
          }
          const value_splitted = filters[key].split(' - ')
          let date1, date2 = ''
          if(value_splitted.length == 1) {
            date1 = value_splitted[0];
            const dateNow = moment(new Date()).format('MM-DD-YYYY');
            // console.log(value_splitted)
            
            if(value_splitted[0].includes('>')) {
              queryFilters += `(convert(date,${key}) <= '${date1}')`
            } else if(value_splitted[0].includes('<')){
              queryFilters += `(convert(date,${key}) >= '${date1}')`
            } else {
              if(date1 > dateNow) {
                queryFilters += `(convert(date,${key}) <= '${date1}')`
              } else {
                queryFilters += `(convert(date,${key}) >= '${date1}')`
              }
            }
          } else {
            date2 = value_splitted[0];
            date1 = value_splitted[1];
            if(value_splitted[0].includes('>')) {
              queryFilters += `(convert(date,${key}) >= '${date1}')`
            } else if(value_splitted[1].includes('>')) {
              queryFilters += `(convert(date,${key}) <= '${date2}')`
            } else if(value_splitted[0].includes('<')) {
              queryFilters += `(convert(date,${key}) <= '${date1}')`
            } else if(value_splitted[1].includes('<')){
              queryFilters += `(convert(date,${key}) >= '${date2}')`
            } else {
              if(date2 > date1) {
                queryFilters += `(convert(date,${key}) between '${date1}' AND '${date2}')`
              } else {
                queryFilters += `(convert(date,${key}) between '${date2}' AND '${date1}')`
  
              }
            }
          }
        } else if(key.includes('/?/')){
          const keySplit = key.split('/?/')
          let keyFilter = ''
          if(keySplit[1].includes('f')){
            const value_splitted = value.split(' - ')
            let date1, date2 = ''
            if(value_splitted.length == 1) {
              date1 = value_splitted[0];
              if(value_splitted[0].includes('>')) {
                keyFilter = `(convert(date,${keySplit[1]}) <= '${date1}')`
              } else {
                keyFilter = `(convert(date,${keySplit[1]}) >= '${date1}')`
              }
            } else {
              date2 = value_splitted[0];
              date1 =value_splitted[1];
              if(value_splitted[0].includes('>')) {
                keyFilter += `(convert(date,${keySplit[1]}) >= '${date1}')`
              } else if(value_splitted[1].includes('>')) {
                keyFilter = `(convert(date,${keySplit[1]}) <= '${date2}')`
              } else {
                keyFilter = `(convert(date,${keySplit[1]}) between '${date2}' AND '${date1}')`
              }
            }
          } else {
            keyFilter =`convert(date,${keySplit[1]}) = ${value}`
          }
          if(grouped) {
            queryFilters += `${grouped}${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          } else {
            queryFilters += `${mainVar} IN (SELECT ${mainVar} FROM ${keySplit[0]} WHERE ${keyFilter})`
          }
        } else{
          queryFilters += `${key} = ${value}`
        }
      }
      x++
    }
  }
  let finalQuery = `${initialQuery} ${queryFilters}`
  return finalQuery
}

const getDetails = async (id, filter, requestVar, filterInverso) => {
  try {
    await sql.connect(sqlConfig)    
    
    const result = await sql.query(`SELECT * from magraficos WHERE id = ${parseInt(id)}`)
    const graphic = result.recordset[0]
    let response = null
    let resultDetails = null
    let resultOtherDetails = null
    if(graphic) {
      response = {}
      const sqlDetalles = graphic.xsqldetalles.replace('@var', `'${requestVar}'`)
      let finalQuery = ''
      const bodyKeys = Object.keys(filter)
      if(bodyKeys.length> 0) {
        if(graphic.xtipografico == 'bar'){
          
          finalQuery = setQuery(bodyKeys[0], filter[bodyKeys[0]], sqlDetalles, graphic.xllave)
        } else {
          finalQuery = setQueryArray(filter, filterInverso, sqlDetalles, graphic.xllave)
        }
      } else {
        finalQuery = sqlDetalles
      }
      resultDetails = await sql.query(finalQuery)
      if(resultDetails.recordset.length> 0) {
        let finalQuery1 = ''
        let sqlOtrosDetalles = graphic.xsqlotrosdetalles.replaceAll('@var', `'${requestVar}'`)
        if(bodyKeys.length> 0) {
          if(graphic.xtipografico == 'bar'){
            if(sqlOtrosDetalles.includes('group by')) {
              const sqlOtrosDetallesD = sqlOtrosDetalles.split('group by')
              sqlOtrosDetalles = sqlOtrosDetallesD[0]
              finalQuery1 = setQuery(bodyKeys[0], filter[bodyKeys[0]], sqlOtrosDetalles, graphic.xllave, 'a.')
              finalQuery1 = finalQuery1 + 'group by' + sqlOtrosDetallesD[1]
              sqlOtrosDetalles = sqlOtrosDetalles + 'group by' + sqlOtrosDetallesD[1]
            } else {
              finalQuery1 = setQuery(bodyKeys[0], filter[bodyKeys[0]], sqlOtrosDetalles, graphic.xllave)
            }
          } else {
            if(sqlOtrosDetalles.includes('group by')) {
              const sqlOtrosDetallesD = sqlOtrosDetalles.split('group by')
              sqlOtrosDetalles = sqlOtrosDetallesD[0]
              finalQuery1 = setQueryArray(filter, filterInverso, sqlOtrosDetalles, graphic.xllave, 'a.')
              finalQuery1 = finalQuery1 + 'group by' + sqlOtrosDetallesD[1]
              sqlOtrosDetalles = sqlOtrosDetalles + 'group by' + sqlOtrosDetallesD[1]
            } else {
              finalQuery1 = setQueryArray(filter, filterInverso, sqlOtrosDetalles, graphic.xllave)
            }
          }
        } else {
          finalQuery1 = sqlOtrosDetalles
        }
        resultOtherDetails = await sql.query(finalQuery1) 
        response = {}
        for (const item of resultOtherDetails.recordset) {
          const itemFindedIndex = resultDetails.recordset.findIndex(element => item[graphic.xllave] == element[graphic.xllave])
          if(itemFindedIndex != -1) {
            resultDetails.recordset.splice(itemFindedIndex,1)
          }
        }
      } else {
        resultOtherDetails = {}
        resultOtherDetails.recordset = []
      }
      // + 'group by' + sqlOtrosDetallesD
      response.headers = graphic.xheadersdetalles.split(',')
      response.keys = graphic.xllavesdetalles.split(',')
      response.headerMaster = graphic.xencabezadodetalles.split(',')
      response.dataTotal = resultDetails.recordset
      response.data = resultOtherDetails.recordset
      // console.log(graphic.xsqlotrosdetalles);
    }
    return response
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}

const exportDetails = async (filters, requestVar, id) => {
  try {
    await sql.connect(sqlConfig)
    let result = null
    const resultA = await sql.query(`SELECT * from magraficos WHERE id = ${parseInt(id)}`)
    const graphic = resultA.recordset[0]
    let response = null
    // console.log(filter);

    if(graphic) {
      response = {}
      let finalQuery1 = ''
      let finalQuery2 = ''
      let sqlOtrosDetalles = graphic.xsqlexportdetalles.replaceAll('@var', `'${requestVar}'`)
      if(graphic.xtipografico == 'bar') {
        
        if(filters.length > 0) {
          for (const filter of filters) {
            if(sqlOtrosDetalles.includes('group by')) {
              const sqlOtrosDetallesD = sqlOtrosDetalles.split('group by')
              sqlOtrosDetalles = sqlOtrosDetallesD[0]
              finalQuery1 = setQuery(filter.key, filter.controlValue, sqlOtrosDetalles, graphic.xllave, 'a.')
              if(sqlOtrosDetallesD[1].includes('UNION')) {
                const querySplitUnion = sqlOtrosDetallesD[1].split('UNION')
                console.log(querySplitUnion);
                finalQuery1 = finalQuery1 + 'group by' + querySplitUnion[0]
                console.log(finalQuery1);
                sqlOtrosDetallesD[1] = querySplitUnion[1]
                finalQuery2 = setQuery(filter.key, filter.controlValue, sqlOtrosDetallesD[1], graphic.xllave, 'a.')
                finalQuery2 =  ' UNION ' + finalQuery2
                finalQuery1 = finalQuery1 + finalQuery2
              } else {
                finalQuery1 = finalQuery1 + 'group by' + sqlOtrosDetallesD[1]
              }
            } else {
              if(sqlOtrosDetalles[1].includes('UNION')) {
                const querySplitUnion = sqlOtrosDetalles.split('UNION')
                finalQuery1 = setQuery(filter.key, filter.controlValue, sqlOtrosDetalles, graphic.xllave)
                querySplitGrouped[1] = querySplitUnion[1]
                finalQuery2 = setQuery(filter.key, filter.controlValue,querySplitGrouped[1], graphic.xllave)
                finalQuery2 =  ' UNION ' + finalQuery2
              } else {
                finalQuery1 = setQuery(filter.key, filter.controlValue, sqlOtrosDetalles, graphic.xllave)
              }
            }
          }
        } else {
          finalQuery1 = sqlOtrosDetalles
        }
      } else {
        if(filters.length > 0) {
          const filtersInverso = filters.map(filter => filter.binverso)
          let filtersToCheck = {} 
          for (const filter of filters) {
            filtersToCheck[filter.key] = filter.controlValue
          } 
          if(sqlOtrosDetalles.includes('group by')) {
            const querySplitGrouped = sqlOtrosDetalles.split('group by')
            sqlOtrosDetalles = querySplitGrouped[0]
            finalQuery1 = setQueryArrayTotal(filtersToCheck, filtersInverso, sqlOtrosDetalles, graphic.xllave, 'a.')
            if(querySplitGrouped[1].includes('UNION')) {
              const querySplitUnion = querySplitGrouped[1].split('UNION')
              finalQuery1 = finalQuery1 + 'group by' + querySplitUnion[0]
              querySplitGrouped[1] = querySplitUnion[1]
              finalQuery2 = setQueryArrayTotal(filtersToCheck, filtersInverso, querySplitGrouped[1], graphic.xllave, 'a.')
              finalQuery2 =  ' UNION ' + finalQuery2
              finalQuery1
            } else {
              finalQuery1 = finalQuery1 + 'group by' + querySplitGrouped[1]
            }
          } else {
            if(sqlOtrosDetalles.includes('UNION')) {
              const querySplitUnion = sqlOtrosDetalles.split('UNION')
              finalQuery1 = setQueryArrayTotal(filtersToCheck, filtersInverso, sqlOtrosDetalles, graphic.xllave, 'a.')
              querySplitGrouped[1] = querySplitUnion[1]
              finalQuery2 = setQueryArrayTotal(filtersToCheck, filtersInverso,querySplitGrouped[1], graphic.xllave, 'a.')
            }
          }
          finalQuery1 = finalQuery1 + finalQuery2
        } else {
          finalQuery1 = sqlOtrosDetalles
        }
      }
      console.log(finalQuery1);
      const resultOtherDetails = await sql.query(`${finalQuery1}`)
      result = resultOtherDetails.recordset
      // console.log(resultOtherDetails.recordset.length)
    }
    return {result: result, graphic:graphic}
  } catch (err) {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const getGraphic = async (id) => {
  try{
    await sql.connect(sqlConfig)
    const result = await sql.query(`SELECT * FROM magraficos where id = ${id}`)
    return result.recordset[0]
  } catch {
    console.log('Error al Obtener el grafico', err)
    return err
  }
}
const getTotals = async (requestVar, query) => {
  try{
    await sql.connect(sqlConfig)

    let queryNew = query.replaceAll('@2var', `'${requestVar.value}'`)
    const result = await sql.query(`${queryNew}`)
    return result.recordset
  } catch {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const getItemsTotals = async (query) => {
  try{
    await sql.connect(sqlConfig)

    const result = await sql.query(`${query}`)
    return result.recordset
  } catch {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const getDetailsTotal = async (values, requestVar, query, xllave, detailsLetter) => {
  try{
    await sql.connect(sqlConfig)
    let queryDetails = query
    let items = []
    let finalQuery1 = ''
    let finalQuery2 = ''
    if(queryDetails.includes('group by')) {
      const querySplitGrouped = queryDetails.split('group by')
      queryDetails = querySplitGrouped[0]
      finalQuery1 = setQueryArrayTotal({[requestVar.key]: requestVar.value}, [requestVar.binverso], queryDetails, xllave, detailsLetter)
      if(querySplitGrouped[1].includes('UNION')) {
        const querySplitUnion = querySplitGrouped[1].split('UNION')
        finalQuery1 = finalQuery1 + 'group by' + querySplitUnion[0]
        querySplitGrouped[1] = querySplitUnion[1]
        finalQuery2 = setQueryArrayTotal({[requestVar.key]: requestVar.value}, [requestVar.binverso], querySplitGrouped[1], xllave, detailsLetter)
        finalQuery2 =  ' UNION ' + finalQuery2
      } else {
        finalQuery1 = finalQuery1 + 'group by' + querySplitGrouped[1]
      }
    } else {
      if(queryDetails.includes('UNION')) {
        const querySplitUnion = queryDetails.split('UNION')
        finalQuery1 = setQueryArrayTotal({[requestVar.key]: requestVar.value}, [requestVar.binverso], queryDetails, xllave, detailsLetter)
        querySplitGrouped[1] = querySplitUnion[1]
        finalQuery2 = setQueryArrayTotal({[requestVar.key]: requestVar.value}, [requestVar.binverso],querySplitGrouped[1], xllave, detailsLetter)
      }
    }
    queryDetails = finalQuery1 + finalQuery2
    for (const value of values) {
      const queryDivided = queryDetails.replaceAll('@var', `'${value.value}'`)
      console.log(queryDivided);
      const result = await sql.query(`${queryDivided}`)
      // const keys = Object.keys(result.recordset[0])
      // result.recordset.unshift({[keys[0]]: value})
      // items = [...items, {[keys[0]]: value.label}, ...result.recordset]
      // console.log(items);
      items.push({label: `Detalles ${value.label}`, data: result.recordset})

    }

    return items
  } catch {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
const getDataTotal = async (query) => {
  try{
    await sql.connect(sqlConfig)
    const result = await sql.query(`${query}`)
    
    return result.recordset
  } catch {
    console.log('Error al Obtener los graficos', err)
    return err
  }
}
export default {
  getGraphicCompanies,
  getGraphicsById,
  getItems,
  getItemsFiltered,
  getFilters,
  getDetails,
  exportDetails,
  getTotals,
  getGraphic,
  getItemsTotals,
  getDetailsTotal,
  getDataTotal,
}
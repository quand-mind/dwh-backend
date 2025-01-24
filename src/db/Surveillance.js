import sql from 'mssql'

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

const getAvisos = async () => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * from maavisos where bactivo = 1`
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los avisos', err)
    return err
  }
}
const getSurveillances = async (fdate) => {
  try {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * from prguardias where fdesde <= '${fdate}' AND fhasta >='${fdate}'`
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const getAvailableGuards = async (date) => {
  try {
    let result = []
    await sql.connect(sqlConfig)
    const getNewUsers = await sql.query(`select cusuario, xnombre + ' ' + xapellido as xnombre from seusuario where bactivo =1 and CROL = 2 and cusuario NOT IN(select distinct(cusuario) from prguardias)`)
    if(getNewUsers.recordset.length > 0){

      const users = getNewUsers.recordset.map(user => user.cusuario)
      const random = getRandomInt(users.length-1)

      result = getNewUsers.recordset.find(user => user.cusuario == users[random])
    } else {
      const getLastUser = await sql.query(`
        select TOP(1) b.cusuario, b.xnombre +' ' + b.xapellido as xnombre,   max(a.fhasta) from prguardias a
        left join seusuario b on b.CUSUARIO = a.cusuario
        where b.BACTIVO = 1
        GROUP BY b.CUSUARIO, b.xnombre, b.xapellido order by max(fhasta) asc
      `)
      result = getLastUser.recordset[0]
    }
    return result
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const setGuard = async (user, date) => {
  try {
    await sql.connect(sqlConfig)
    let newDateDesde = new Date(date)
    let newDateHasta = new Date(date)
    newDateHasta.setDate(newDateHasta.getDate() + 6)
    console.log(newDateHasta);
    
    await sql.query(`insert into prguardias (cusuario, fdesde, fhasta) values (${user}, '${newDateDesde.toLocaleDateString('en-US')}', '${newDateHasta.toLocaleDateString('en-US')}')`)
    return {id: user, fdesde: newDateDesde.toLocaleDateString('en-GB'), fhasta: newDateHasta.toLocaleDateString('en-GB')}
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export default {
  getAvisos,
  getSurveillances,
  getAvailableGuards,
  setGuard
}
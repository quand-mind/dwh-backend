import sql from 'mssql'

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
const getAvailableGuards = async (fdate) => {
  try {
    await sql.connect(sqlConfig)
    
    let date = fdate;
    const users = await sql.query(`select count(cusuario) as count from seusuario where crol = 2 and bactivo = 1`)
    date.setDate(date.getDate() - (users.recordset[0].count * 7))
    date = date.toLocaleDateString('en-US')
    const result = await sql.query(`select cusuario, xnombre + ' ' + xapellido as xnombre from seusuario where crol = 2 and bactivo = 1 and cusuario not in (select cusuario from prguardias where fdesde >= '${date}')`)
    return result.recordset
  } catch (err) {
    console.log('Error al Obtener los clientes', err)
    return err
  }
}
const setGuard = async (users) => {
  try {
    await sql.connect(sqlConfig)
    let newDateDesde = new Date()
    let newDateHasta = new Date()
    newDateHasta.setDate(newDateHasta.getDate() + 6)
    
    const random = getRandomInt(users.length-1)
    console.log(users[random]);
    const setGuard = await sql.query(`insert into prguardias (cusuario, fdesde, fhasta) values (${users[random]}, '${newDateDesde.toLocaleDateString('en-US')}', '${newDateHasta.toLocaleDateString('en-US')}')`)
    return {id: users[random], fdesde: newDateDesde.toLocaleDateString('en-CA'), fhasta: newDateHasta.toLocaleDateString('en-CA')}
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
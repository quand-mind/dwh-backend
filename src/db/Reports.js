import sql from 'mssql'


const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  connectionTimeout: 150000,
  requestTimeout: 150000,
  server: process.env.DB_server,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 150000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

const gestoresPoliza = async (body) => {
  const pool = await sql.connect(sqlConfig);
  const request = pool.request();

  const inputs = { 
    finicio : {type : sql.Date , value : `${body?.finicio}`},
    ffin : {type : sql.Date , value : `${body?.ffin}`}
  };
  
  for (const [key, param] of Object.entries(inputs)) { request.input(key, param.type, param.value); }
  let catrina = await request.execute('spPolizaGestores');

  return catrina.recordset
}

export default {
  gestoresPoliza,
}
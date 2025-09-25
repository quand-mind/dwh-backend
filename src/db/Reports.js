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

const gestoresRecibos = async (body) => {
  const pool = await sql.connect(sqlConfig);
  const request = pool.request();

  const inputs = { 
    estado : {type : sql.Char(4) , value : null},
    fdesdePol : {type : sql.Date , value : `${body?.finicio}`},
    fhastaPol : {type : sql.Date , value : `${body?.ffin}`},
    ramo : {type : sql.Int , value : null},
    productor : {type : sql.Int , value : null},
    canal : {type : sql.VarChar(10) , value : null},
    moneda : {type : sql.VarChar(4) , value : null},
    poliza : {type : sql.Char(30) , value : null},
    cliente : {type : sql.Numeric(11,0) , value : null},
    acreedor : {type : sql.Numeric(11,0) , value : null},
    asegurado : {type : sql.Numeric(11,0) , value : null},
    beneficiario : {type : sql.Numeric(11,0) , value : null},
    tomador : {type : sql.Numeric(11,0) , value : null},
  };
  
  for (const [key, param] of Object.entries(inputs)) { request.input(key, param.type, param.value); }
  let catrina = await request.execute('spRecibosGestores');

  return catrina.recordset
}

export default {
  gestoresPoliza,
  gestoresRecibos
}
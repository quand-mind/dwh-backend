import sql from "mssql";


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

const verifyIfUsernameExists = async (xlogin) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('xemail', sql.NVarChar, xlogin)
            .query('select CUSUARIO, XEMAIL, XNOMBRE from seusuario where xemail = @xemail and bactivo = 1')
            await pool.close();
        return { 
            result: result 
        };
    }
    catch (error) {
        console.log(error.message)
        return { error: error.message }
    }
}

const verifyIfPasswordMatchs = async (xlogin, xcontrasena) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('xemail', sql.NVarChar, xlogin)
            .input('xcontrasena', sql.NVarChar, xcontrasena)
            .query('select CUSUARIO from seusuario where xemail = @xemail and xcontrasena = @xcontrasena')
            await pool.close();
        return { result: result };
    }
    catch (error) {
        console.log(error.message)
        return { error: error.message };
    }
}

const getOneUser = async (xlogin) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
           .input('xemail', sql.NVarChar, xlogin)
           .query('select * from seusuario where xemail = @xemail')
        if (result.rowsAffected < 1) {
            return false;
        }
        await pool.close();
        return result.recordset[0];
    }
    catch (error) {
        console.log(error.message)
        return { error: error.message };
    }
}


export default {
    verifyIfUsernameExists,
    verifyIfPasswordMatchs,
    getOneUser
}
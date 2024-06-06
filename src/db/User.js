import sql from "mssql";


const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    server: process.env.DB_server,
    database: process.env.DB_NAME,
    requestTimeout: 60000,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

const verifyIfUsernameExists = async (xlogin) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('xemail', sql.NVarChar, xlogin)
            .query('select CUSUARIO, XEMAIL, XNOMBRE from SEUSUARIO where xemail = @xemail')
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
            .query('select CUSUARIO from SEUSUARIO where xemail = @xemail and xcontrasena = @xcontrasena')
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
           .query('select * from SEUSUARIO where xemail = @xemail')
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
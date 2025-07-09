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

const getMonedaData = async () => {
    const rates = [];
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`SELECT cmoneda, ptasamon FROM Sis2000_RESP..mamonedas WHERE cmoneda IN ('$', 'EUR')`);
        // await pool.close();

        for (const element of result.recordset) {
            rates.push({
                value: element.ptasamon,
                cmoneda: element.cmoneda
            });
        }
        return {rates: rates};
    } catch (err) {
        return { error: err.message };
    }
}

const updateMaster = async (tasa, cmoneda) => {
    // Reemplazar la coma por un punto y eliminar espacios
    let numero = tasa.toString().replace(',', '.').trim();
    let numeroConvertido = Number(numero); // Convertir a número
    numeroConvertido = Number(numeroConvertido.toFixed(6))
    console.log(numeroConvertido);
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('cmoneda', sql.Char(4), cmoneda)
            .input('fultmod', sql.DateTime, new Date())
            .input('ptasamon', sql.Float(10, 6), numeroConvertido) // Usar el valor convertido
            .query(`UPDATE Sis2000_RESP..mamonedas SET ptasamon = @ptasamon, fultmod = @fultmod WHERE cmoneda = @cmoneda`);

        // await pool.close();
        result = await updateHistory(numeroConvertido, cmoneda)
        return result;
    } catch (err) {
        return { error: err.message };
    }
}

const updateHistory = async (tasa, cmoneda) => {
    // Reemplazar la coma por un punto y eliminar espacios

    try{
        let pool = await sql.connect(sqlConfig);
        let fechaActual = new Date()
        fechaActual.setHours(-4, 0,0,0)
        console.log(fechaActual);
        // fechaActual.setDate(fechaActual.getDate() + 1)
        let result = await pool.request()
        .input('tasa', sql.Decimal(10, 6), tasa)
        .input('fmoneda', sql.DateTime, fechaActual)
        .input('fingreso', sql.Date, new Date())
        .input('cmoneda', sql.Char(4), cmoneda)
        .input('cusuario', sql.Numeric(11), 1)
        .query('insert into Sis2000_RESP..mavamoneda (cmoneda,ptasamon, fingreso, fmoneda, cusuario ) values( @cmoneda,@tasa, @fingreso, @fmoneda, @cusuario) ');
        // await pool.close();
        return result;
              
    }catch(err){
        return { error: err.message };
        }
}

export default {
    updateMaster,
    updateHistory,
    getMonedaData
}

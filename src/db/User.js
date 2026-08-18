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
            .query('select cusuario, xemail, xnombre from seusuarios_portal where xemail = @xemail and bactivo = 1')
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
            .query(`select cusuario from seusuarios_portal where xemail = '${xlogin}' and ( xcontrasena = '${xcontrasena}' AND xcontrasena is not null)`)
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
            .query('select * from seusuarios_portal where xemail = @xemail')
        if (result.rowsAffected < 1) {
            return false;
        }
        const gestor = await await pool.request().query(`select * from magestor where xcorreo = '${xlogin}'`)
        if (gestor.recordset.length > 0) {
            result.recordset[0].cgestor = gestor.recordset[0].cgestor;
            result.recordset[0].ccanalalt = gestor.recordset[0].ccanalalt;
        }
        if ((gestor.recordset[0]?.ccanalalt) && !(gestor.recordset[0]?.cscanalalt)) { result.recordset[0].main = true } else { result.recordset[0].main = false }

        await pool.close();
        return result.recordset[0];
    }
    catch (error) {
        console.log(error.message)
        return { error: error.message };
    }
}

const registerGestor = async (code, password) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`SELECT * from Sis2000_QA..magestor where cgestor = '${code}'`)
        if (result.rowsAffected < 1) {
            return { error: 'Gestor no encontrado' };
        }
        const gestor = await await pool.request().query(`UPDATE Sis2000_QA..magestor set contrasena = '${password}' where cgestor = '${code}'`)

        await pool.close();
        return { message: 'Gestor registrado correctamente' };
    }
    catch (error) {
        console.log(error.message)
        return { error: error.message };
    }
}

const checkGestor = async (email) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`SELECT cgestor, xcorreo, xgestor from Sis2000_QA..magestor where xcorreo = '${email}' and contrasena IS NULL`)

        if (result.rowsAffected < 1) {
            return { error: 'Correo inválido' };
        }

        await pool.close();
        return result.recordset[0];
    }
    catch (error) {
        console.log(error.message)
        return { error: error.message };
    }
}


const checkUserForRecovery = async (identifier) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const strId = String(identifier).trim();

        // 1. Search in seusuarios_portal
        let portalUserResult = await pool.request()
            .input('identifier', sql.NVarChar, strId)
            .query('SELECT cusuario, xnombre, xemail, crol, bactivo FROM seusuarios_portal WHERE xemail = @identifier');

        let user = null;
        if (portalUserResult.recordset.length > 0) {
            user = portalUserResult.recordset[0];
            if (user.bactivo === 0 || user.bactivo === false) {
                await pool.close();
                return { error: 'El usuario se encuentra inactivo' };
            }
        }

        // 2. Check in magestor for complementary info or standalone gestor
        const emailOrCode = user?.xemail || strId;
        let gestorResult = await pool.request()
            .input('searchVal', sql.NVarChar, emailOrCode)
            .input('origId', sql.NVarChar, strId)
            .query('SELECT cgestor, xcorreo, xgestor, ccanalalt FROM Sis2000_QA..magestor WHERE xcorreo = @searchVal');

        let gestor = gestorResult.recordset.length > 0 ? gestorResult.recordset[0] : null;

        if (!user && !gestor) {
            await pool.close();
            return { error: 'Usuario no encontrado' };
        }

        const resolvedUser = {
            cusuario: user?.cusuario || gestor?.cgestor,
            cgestor: gestor?.cgestor || user?.cgestor || null,
            xemail: user?.xemail || gestor?.xcorreo,
            xcorreo: user?.xemail || gestor?.xcorreo,
            xnombre: user?.xnombre || gestor?.xgestor,
            xgestor: gestor?.xgestor || user?.xnombre,
            crol: user?.crol || null
        };

        await pool.close();
        return resolvedUser;
    }
    catch (error) {
        console.log(error.message);
        return { error: error.message };
    }
}

const updateUserPassword = async (identifier, password) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const strId = String(identifier).trim();

        // 1. Update in base table seusuario
        const seusuarioUpdate = await pool.request()
            .input('identifier', sql.NVarChar, strId)
            .input('password', sql.NVarChar, password)
            .query('UPDATE seusuario SET XCONTRASENA = @password, FMODIFICACION = GETDATE() WHERE XEMAIL = @identifier OR CAST(CUSUARIO AS VARCHAR) = @identifier');

        // 2. Update in Sis2000_QA..magestor
        const gestorUpdate = await pool.request()
            .input('identifier', sql.NVarChar, strId)
            .input('password', sql.NVarChar, password)
            .query('UPDATE Sis2000_QA..magestor SET contrasena = @password, fultmod = GETDATE() WHERE xcorreo = @identifier OR CAST(cgestor AS VARCHAR) = @identifier');

        await pool.close();

        const affectedSeusuario = seusuarioUpdate.rowsAffected ? seusuarioUpdate.rowsAffected[0] : 0;
        const affectedGestor = gestorUpdate.rowsAffected ? gestorUpdate.rowsAffected[0] : 0;

        if (affectedSeusuario === 0 && affectedGestor === 0) {
            return { error: 'Usuario no encontrado para actualizar la contraseña' };
        }

        return { message: 'Contraseña actualizada exitosamente' };
    }
    catch (error) {
        console.log(error.message);
        return { error: error.message };
    }
}


const saveUserCode = async (userCode, email, code) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const strUserCode = userCode ? String(userCode).trim() : null;
        const strEmail = email ? String(email).trim() : null;
        const strCode = String(code).trim();

        // Invalidate previous unused codes
        await pool.request()
            .input('user_code', sql.VarChar(100), strUserCode)
            .input('email', sql.VarChar(255), strEmail)
            .query(`
                UPDATE dbo.usuarios_code 
                SET used = 1 
                WHERE (
                    (@email IS NOT NULL AND email = @email) 
                    OR (@user_code IS NOT NULL AND user_code = @user_code)
                ) AND used = 0
            `);

        // Insert new code with 10 minutes expiration
        const insertResult = await pool.request()
            .input('user_code', sql.VarChar(100), strUserCode)
            .input('email', sql.VarChar(255), strEmail)
            .input('code', sql.VarChar(10), strCode)
            .query(`
                INSERT INTO dbo.usuarios_code (user_code, email, code, created_at, expires_at, used)
                OUTPUT INSERTED.id, INSERTED.user_code, INSERTED.email, INSERTED.code, INSERTED.created_at, INSERTED.expires_at
                VALUES (@user_code, @email, @code, GETDATE(), DATEADD(MINUTE, 10, GETDATE()), 0)
            `);

        await pool.close();
        return insertResult.recordset[0];
    } catch (error) {
        console.log('Error saving user code:', error.message);
        return { error: error.message };
    }
}

const validateUserCode = async (identifier, code) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const strId = identifier ? String(identifier).trim() : null;
        const strCode = String(code).trim();

        const result = await pool.request()
            .input('identifier', sql.VarChar(255), strId)
            .input('code', sql.VarChar(10), strCode)
            .query(`
                SELECT TOP 1 id, user_code, email, code, created_at, expires_at, used,
                       CASE WHEN expires_at >= GETDATE() THEN 1 ELSE 0 END AS is_valid
                FROM dbo.usuarios_code
                WHERE code = @code
                  AND (
                    @identifier IS NULL 
                    OR email = @identifier 
                    OR user_code = @identifier
                  )
                ORDER BY created_at DESC
            `);

        if (result.recordset.length === 0) {
            await pool.close();
            return { error: 'Código de verificación inválido' };
        }

        const record = result.recordset[0];

        if (record.used === true || record.used === 1) {
            await pool.close();
            return { error: 'Este código ya ha sido utilizado. Por favor solicite uno nuevo.' };
        }

        if (record.is_valid === 0) {
            await pool.close();
            return { error: 'El código de verificación ha expirado (límite de 10 minutos). Por favor solicite uno nuevo.' };
        }

        // Mark code as used
        await pool.request()
            .input('id', sql.Int, record.id)
            .query('UPDATE dbo.usuarios_code SET used = 1 WHERE id = @id');

        await pool.close();
        return {
            success: true,
            id: record.id,
            user_code: record.user_code,
            email: record.email,
            code: record.code
        };
    } catch (error) {
        console.log('Error validating user code:', error.message);
        return { error: error.message };
    }
}


export default {
    verifyIfUsernameExists,
    verifyIfPasswordMatchs,
    getOneUser,
    registerGestor,
    checkGestor,
    checkUserForRecovery,
    updateUserPassword,
    saveUserCode,
    validateUserCode
}
import User from '../db/User.js';
import authService from './../services/authService.js';
import emailService from './../services/emailService.js';

const createJWT = async (req, res) => {
    const xlogin = req.body.xlogin;
    const verifiedUsername = await authService.verifyIfUsernameExists(xlogin);
    if (verifiedUsername.error) {
        res
            .status(verifiedUsername.code)
            .send({
                status: false,
                message: verifiedUsername.error
            });
        return;
    }
    const xcontrasena = req.body.xcontrasena;
    const verifiedPassword = await authService.verifyIfPasswordMatchs(xlogin, xcontrasena);
    if (verifiedPassword.error) {
        res
            .status(verifiedPassword.code)
            .send({
                status: false,
                message: verifiedPassword.error
            });
        return;
    }
    const user = await authService.getOneUser(xlogin);
    console.log(user)
    if (user.error) {
        return res
            .status(user.code)
            .send({
                status: false,
                message: user.error
            });
    }
    const jwt = authService.createJWT(user);
    res
        .status(201).send({
            status: true,
            message: 'Usuario Autenticado',
            data: {
                cusuario: user.cusuario,
                crol: user.crol,
                // ccanal: user.ccanalalt,
                cgestor: user.cgestor,
                main: user.main,
                citem: user.citem,
                centidad: user.centidad,
                mainItem: user.mainItem,
                id_adviser: user.id_adviser,
                id_agency: user.id_agency,
                // bcrear: user.bcrear,
                // bconsultar: user.bconsultar,
                // bmodificar: user.bmodificar,
                // beliminar: user.beliminar,
                xusuario: user.xnombre,
                xemail: user.xemail,
                token: 'Bearer ' + jwt
            }
        });
    return;
};

const checkToken = async (req, res) => {
    // console.log(req.body.token)
    const token = req.headers['authorization'].split('Bearer ')
    const checkToken = authService.checkToken(token[1])
    if (checkToken.error) {
        return res
            .status(checkToken.code)
            .send({
                status: false,
                message: checkToken.error
            });
    }
    return res
        .status(200)
        .send({
            status: true,
            data: {
                token: checkToken
            }
        })
}
const checkGestor = async (req, res) => {

    const gestor = await User.checkGestor(req.body.xcorreo)

    if (gestor.error) {
        return res
            .status(500)
            .send({
                status: false,
                message: gestor.error
            });
    }

    const token = authService.createToken(gestor, 1)

    return res
        .status(200)
        .send({
            status: true,
            data: { gestor: gestor, token: token }
        })
}

const registerGestor = async (req, res) => {
    // console.log(req.body.token)
    const token = req.headers['authorization'].split('Bearer ')
    const checkToken = authService.checkToken(token[1])

    const gestor = await User.registerGestor(checkToken.cgestor, req.body.xcontrasena)

    if (gestor.error) {
        return res
            .status(500)
            .send({
                status: false,
                message: gestor.error
            });
    }
    return res
        .status(200)
        .send({
            status: true,
            data: {
                message: gestor.message
            }
        })
}

const getUserModules = async (req, res) => {
    const userModules = await authService.getUserModules(req.body.cusuario);
    if (userModules.error) {
        return res
            .status(userModules.code)
            .send({
                status: false,
                message: userModules.error
            });
    }
    return res
        .status(200)
        .send({
            status: true,
            data: {
                groups: userModules
            }
        })
}

const checkRecover = async (req, res) => {
    const identifier = req.body.xemail || req.body.xcorreo || req.body.cusuario || req.body.code;

    if (!identifier) {
        return res
            .status(400)
            .send({
                status: false,
                message: 'Debe ingresar un correo electrónico o código de usuario'
            });
    }

    const user = await User.checkUserForRecovery(identifier);

    if (user.error) {
        return res
            .status(404)
            .send({
                status: false,
                message: user.error
            });
    }

    const token = authService.createToken(user, 1);

    return res
        .status(200)
        .send({
            status: true,
            message: 'Usuario validado exitosamente',
            data: {
                user: user,
                token: token
            }
        });
}

const resetPassword = async (req, res) => {
    const password = req.body.xcontrasena || req.body.contrasena || req.body.password;

    if (!password) {
        return res
            .status(400)
            .send({
                status: false,
                message: 'Debe ingresar una contraseña'
            });
    }

    let identifier = req.body.xemail || req.body.xcorreo || req.body.cusuario || req.body.code;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.includes('Bearer ')) {
        const token = authHeader.split('Bearer ')[1]?.trim();
        if (token) {
            const decoded = authService.checkToken(token);
            if (decoded.error) {
                return res
                    .status(401)
                    .send({
                        status: false,
                        message: decoded.error
                    });
            }
            identifier = decoded.xemail || decoded.xcorreo || decoded.cusuario || decoded.cgestor || identifier;
        }
    }

    if (!identifier) {
        return res
            .status(400)
            .send({
                status: false,
                message: 'No se pudo identificar al usuario a actualizar'
            });
    }

    const result = await User.updateUserPassword(identifier, password);

    if (result.error) {
        return res
            .status(500)
            .send({
                status: false,
                message: result.error
            });
    }

    return res
        .status(200)
        .send({
            status: true,
            data: {
                message: result.message
            }
        });
}

const sendVerificationCode = async (req, res) => {
    const email = req.body.email || req.body.xemail || req.body.xcorreo;
    let userCode = req.body.user_code || req.body.cusuario || req.body.cgestor || req.body.code;

    if (!email && !userCode) {
        return res
            .status(400)
            .send({
                status: false,
                message: 'Debe ingresar un correo electrónico o código de usuario'
            });
    }

    const identifier = email || userCode;
    const user = await User.checkUserForRecovery(identifier);

    if (user.error) {
        return res
            .status(404)
            .send({
                status: false,
                message: user.error
            });
    }

    const targetEmail = email || user.xemail || user.xcorreo;
    const targetUserCode = userCode || user.cusuario || user.cgestor;
    const userName = user.xnombre || user.xgestor || '';

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save in database with 10-minute expiry
    const savedCode = await User.saveUserCode(targetUserCode, targetEmail, code);

    if (savedCode.error) {
        return res
            .status(500)
            .send({
                status: false,
                message: 'Error al generar el código de verificación: ' + savedCode.error
            });
    }

    // Send email with 6-digit code
    const emailResult = await emailService.sendVerificationCodeEmail(targetEmail, code, userName);

    if (emailResult.error) {
        return res
            .status(500)
            .send({
                status: false,
                message: 'Error al enviar el correo electrónico: ' + emailResult.error
            });
    }

    return res
        .status(200)
        .send({
            status: true,
            message: 'Código de verificación enviado exitosamente al correo electrónico',
            data: {
                email: targetEmail,
                expires_in_minutes: 10
            }
        });
}

const validateVerificationCode = async (req, res) => {
    const code = req.body.code || req.body.codigo;
    const identifier = req.body.email || req.body.xemail || req.body.xcorreo || req.body.user_code || req.body.cusuario || req.body.cgestor;

    if (!code) {
        return res
            .status(400)
            .send({
                status: false,
                message: 'Debe ingresar el código de verificación'
            });
    }

    const validationResult = await User.validateUserCode(identifier, code);

    if (validationResult.error) {
        return res
            .status(400)
            .send({
                status: false,
                message: validationResult.error
            });
    }

    // Lookup user details to generate authorization token for password reset
    const userSearchId = validationResult.email || validationResult.user_code || identifier;
    const user = await User.checkUserForRecovery(userSearchId);

    const userData = !user.error ? user : {
        cusuario: validationResult.user_code,
        xemail: validationResult.email,
        xcorreo: validationResult.email
    };

    const token = authService.createToken(userData, 1);

    return res
        .status(200)
        .send({
            status: true,
            message: 'Código validado exitosamente',
            data: {
                user: userData,
                token: token
            }
        });
}

export default {
    createJWT,
    getUserModules,
    checkToken,
    registerGestor,
    checkGestor,
    checkRecover,
    resetPassword,
    sendVerificationCode,
    validateVerificationCode
}
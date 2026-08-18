import User from '../db/User.js';
import authService from './../services/authService.js';

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
                ccanal: user.ccanalalt,
                cgestor: user.cgestor,
                main: user.main,
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

export default {
    createJWT,
    getUserModules,
    checkToken,
    registerGestor,
    checkGestor
}
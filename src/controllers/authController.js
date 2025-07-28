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
                cusuario: user.CUSUARIO,
                crol: user.CROL,
                ccanal: user.ccanalalt,
                cgestor: user.cgestor,
                // bcrear: user.bcrear,
                // bconsultar: user.bconsultar,
                // bmodificar: user.bmodificar,
                // beliminar: user.beliminar,
                xusuario: `${user.XNOMBRE}${user.XAPELLIDO ?  `${user.XAPELLIDO}` : ''}`,
                ccompania: user.CCOMPANIA,
                xemail: user.XEMAIL,
                cpais: user.CPAIS,
                ctipo_sistema: user.CTIPO_SISTEMA,
                token: 'Bearer ' + jwt
            }
        });
    return;
};

const checkToken = async (req, res) => {
    // console.log(req.body.token)
    const token = req.body.token.split('Bearer ')
    const checkToken = authService.checkToken(token[1])
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
}
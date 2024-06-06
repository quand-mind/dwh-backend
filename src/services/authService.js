import User from '../db/User.js';
import jwt from 'jsonwebtoken';
import moment from 'moment';

const verifyIfUsernameExists = async (xlogin) => {
    const verifiedUsername = await User.verifyIfUsernameExists(xlogin);
    if (verifiedUsername.error) {
        return { error: verifiedUsername.error, code: 500 };
    }
    if (verifiedUsername.result.rowsAffected < 1) {
        return { error: "Authentication Error", code: 401 };
    }
    return verifiedUsername;
}

const verifyIfPasswordMatchs = async (xlogin, xcontrasena) => {
    const verifiedPassword = await User.verifyIfPasswordMatchs(xlogin, xcontrasena);
    if (verifiedPassword.error) {
        return { error: verifiedPassword.error, code: 500 };
    }
    if (verifiedPassword.result.rowsAffected < 1) {
        return { error: "Authentication Error", code: 401 };
    }
    return verifiedPassword;
};

const createJWT = (user) => {
    const payload = {
        cusuario: user.CUSUARIO,
        xemail: user.XEMAIL,
        iat: moment().unix(),
        exp: moment().add(1, 'day').unix(),
    }
    console.log(payload);
    return jwt.sign(payload, process.env.JWT_SECRET)
}

const checkToken = (token) => { 
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
}

const getOneUser = async (xlogin) => {
    const user = await User.getOneUser(xlogin);
    if (user.error) {
        return { error: user.error };
    }
    if (!user) {
        return { errorNotFound: "User not found" };
    }
    if (user.xlogin) {
        user.xlogin
    }
    return user;
}

export default {
    verifyIfUsernameExists,
    verifyIfPasswordMatchs,
    createJWT,
    getOneUser,
    checkToken
}
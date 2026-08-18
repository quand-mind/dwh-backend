import express from 'express';

import authController from '../../src/controllers/authController.js';

const router = express.Router();

router

    .post("/signIn", authController.createJWT)
    .post("/user-modules", authController.getUserModules)
    .post("/checkToken", authController.checkToken)
    .post("/checkGestor", authController.checkGestor)
    .post("/registerGestor", authController.registerGestor)

export default router;
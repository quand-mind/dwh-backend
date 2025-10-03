import express from 'express';

import maestrosController from '../../src/controllers/maestrosController.js';

const router = express.Router();

router
    .get("/ramos", maestrosController.getRamos)
    .get("/origenes", maestrosController.getOrigenes)
    .get("/reports", maestrosController.getReports)
    .get("/gestores/:ccanal", maestrosController.getGestores)
    .get("/origenesApi", maestrosController.getOrigenesApi)
    .get("/canalesVenta", maestrosController.getCanalesVenta)
    .get("/subcanales/:ccanal", maestrosController.getSubCanalesVenta)

    
export default router;
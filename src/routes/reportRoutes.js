import express from 'express';

import reportsController from '../../src/controllers/reportsController.js';

const router = express.Router();

router
    .post("/poliza/gestores", reportsController.gestoresPoliza)
    .post("/recibos/gestores", reportsController.gestoresRecibos)
    .post("/recibos/producto", reportsController.gestoresRecibosProducto)
    
export default router;
import express from 'express';

import reportsController from '../../src/controllers/reportsController.js';

const router = express.Router();

router
    .post("/poliza/gestores", reportsController.gestoresPoliza)
    
export default router;
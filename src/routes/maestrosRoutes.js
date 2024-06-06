import express from 'express';

import maestrosController from '../../src/controllers/maestrosController.js';

const router = express.Router();

router
    .get("/ramos", maestrosController.getRamos)

    
export default router;
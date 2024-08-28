import express from 'express';

import campaignController from '../../src/controllers/campaignController.js';

const router = express.Router();

router
    .get("/getCampaignsCompanies", campaignController.getCampaignsCompanies)
    .get("/getProducts/:table", campaignController.getProducts)

    
export default router;
import express from 'express';

import campaignController from '../../src/controllers/campaignController.js';

const router = express.Router();

router
    .get("/getCampaignsCompanies", campaignController.getCampaignsCompanies)
    .get("/getProducts/:corigen", campaignController.getProducts)
    .post("/getClientsProduct/:corigen/:cramo", campaignController.getClientsProduct)
    .post("/getClientsData", campaignController.getClientsData)
    .get("/getProductsPlan/:corigen/:cramo", campaignController.getProductsPlan)

    
export default router;
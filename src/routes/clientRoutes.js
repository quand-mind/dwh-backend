import express from 'express';

import clientController from '../../src/controllers/clientController.js';

const router = express.Router();

router
    .get("/getAll/:first", clientController.getAllClients)
    .get("/setAll", clientController.setAllClients)
    .get("/getDashboardClientData", clientController.getDashboardClientData)
    .get("/get/:page", clientController.getClients)
    .post("/searchOcurrences/:string", clientController.getAllClientsAndSearch)
    .get("/getProducts/:rif", clientController.getProducts)
    .post("/countClients", clientController.countClients)

    
export default router;
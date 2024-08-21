import express from 'express';

import clientController from '../../src/controllers/clientController.js';

const router = express.Router();

router
    // .get("/getAll/:first", clientController.getAllClients)
    .get("/setAll", clientController.setAllClients)
    .get("/getDashboardClientData", clientController.getDashboardClientData)
    .get("/get/:page", clientController.getClients)
    .post("/getCountOcurrences/:string", clientController.getCountClientsAndSearch)
    .post("/searchOcurrences/:page/:string", clientController.getAllClientsAndSearch)
    .get("/getClientData/:orden", clientController.getClientData)
    .get("/getProducts/:rif", clientController.getProducts)
    .post("/countClients", clientController.countClients)

    
export default router;
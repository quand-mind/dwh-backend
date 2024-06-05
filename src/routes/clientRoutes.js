import express from 'express';

import clientController from '../../src/controllers/clientController.js';

const router = express.Router();

router
    .get("/getAll", clientController.getAllClients)
    .get("/get/:page", clientController.getClients)
    .get("/searchOcurrences/:string", clientController.getAllClientsAndSearch)
    .get("/getProducts/:rif", clientController.getProducts)
    .post("/countClients", clientController.countClients)

    
export default router;
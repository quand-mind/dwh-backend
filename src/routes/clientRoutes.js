import express from 'express';

import clientController from '../../src/controllers/clientController.js';

const router = express.Router();

router
    // .get("/getAll/:first", clientController.getAllClients)
    .get("/setAll", clientController.setAllClients)
    .get("/getDashboardClientData", clientController.getDashboardClientData)
    .get("/get/:page", clientController.getClients)
    .get("/searchTable/:table", clientController.searchWithTable)
    .get("/getCompanyData/:table", clientController.getSystemData)
    .post("/getCountOcurrences/:string", clientController.getCountClientsAndSearch)
    .post("/searchOcurrences/:page/:string", clientController.getAllClientsAndSearch)
    .get("/getClientData/:orden", clientController.getClientData)
    .post("/:orden/addObservation", clientController.addObservation)
    .get("/getProducts/:rif", clientController.getProducts)
    .post("/countClients", clientController.countClients)
    .get("/getCompanies", clientController.getCompanies)

    
export default router;
import express from 'express';

import graphicsController from '../../src/controllers/graphicsControler.js';

const router = express.Router();

router
    .get("/getData/:id", graphicsController.getGraphicsById)
    .post("/getItems", graphicsController.getItems)
    .post("/getItemsFilters", graphicsController.getItemsFiltered)
    .get("/:id/getFilters", graphicsController.getFilters)
    .post("/getDetails/:id", graphicsController.getDetails)

    
export default router;
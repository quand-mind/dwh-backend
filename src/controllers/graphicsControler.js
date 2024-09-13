import Graphic from '../db/Graphic.js';

const getGraphicsById = async (req, res) => {
  try {
    const graphics = await Graphic.getGraphicsById(req.params.id);

    if (graphics.error) {
      return res.status(companies.code).send({
        status: false,
        message: companies.error
      });
    }

    res.send(graphics)
    
  } catch (error) {
    
  }
}
const getItems = async (req, res) => {
  try {
    const items = await Graphic.getItems(req.body.queryItems, req.body.queryTotal);

    if (items.error) {
      return res.status(items.code).send({
        status: false,
        message: items.error
      });
    }

    res.send(items)
    
  } catch (error) {
    
  }
}
const getItemsFiltered = async (req, res) => {
  try {
    const items = await Graphic.getItemsFiltered(req.body.filters, req.body.queryItems, req.body.queryTotal);

    if (items.error) {
      return res.status(items.code).send({
        status: false,
        message: items.error
      });
    }

    res.send(items)
    
  } catch (error) {
    
  }
}

export default {
  getGraphicsById,
  getItemsFiltered,
  getItems
}
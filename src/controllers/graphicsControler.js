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
const getClientsProduct = async (req, res) => {
  try {
    const clients = await Campaign.getClientsProduct(req.params.corigen, req.params.cramo, req.body);

    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }
    clients.forEach(element => {
      element.selected = false
      element.cestatus = null
    });

    res.send(clients)
    
  } catch (error) {
    
  }
}
const getClientsData = async (req, res) => {
  try {
    const clients = await Campaign.getClientsData(req.body);

    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }

    res.send(clients)
    
  } catch (error) {
    
  }
}
const setCampaignClients = async (req, res) => {
  try {
    const clients = await Campaign.setCampaignClients(req.body);
    console.log(clients);
    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }

    res.send(clients)
    
  } catch (error) {
    
  }
}
const getProductsPlan = async (req, res) => {
  try {
    const products = await Campaign.getProductsPlan(req.params.corigen, req.params.cramo);

    if (products.error) {
      return res.status(products.code).send({
        status: false,
        message: products.error
      });
    }

    res.send(products)
    
  } catch (error) {
    
  }
}

export default {
  getGraphicsById,
  getItems
}
import Campaign from '../db/Campaign.js';

const getCampaignsCompanies = async (req, res) => {
  try {
    const companies = await Campaign.getCampaignsCompanies();

    if (companies.error) {
      return res.status(companies.code).send({
        status: false,
        message: companies.error
      });
    }
    const gettedCompanies = companies.map(element => {
      return {text: element.xorigen, value: element.corigen, url: element.xtabla}
    });

    res.send(gettedCompanies)
    
  } catch (error) {
    
  }
}
const getProducts = async (req, res) => {
  try {
    const products = await Campaign.getProducts(req.params.corigen);

    if (products.error) {
      return res.status(products.code).send({
        status: false,
        message: products.error
      });
    }
    const gettedProducts = products.map(element => {
      return {text: element.xplan, id: element.cramo, value: element.nsin_poliza, other_value: element.npolizas}
    });

    res.send(gettedProducts)
    
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
  getCampaignsCompanies,
  getProducts,
  getClientsProduct,
  getClientsData,
  setCampaignClients,
  getProductsPlan,
}
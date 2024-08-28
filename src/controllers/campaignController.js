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
    const products = await Campaign.getProducts(req.params.table);

    if (products.error) {
      return res.status(products.code).send({
        status: false,
        message: products.error
      });
    }
    const gettedProducts = products.map(element => {
      return {text: element.xplan, id: element.id, value: element.nasegurados_sin_prod}
    });

    res.send(gettedProducts)
    
  } catch (error) {
    
  }
}
const getClientsProduct = async (req, res) => {
  try {
    const clients = await Campaign.getClientsProduct(req.params.cramo, req.params.page);

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

export default {
  getCampaignsCompanies,
  getProducts,
  getClientsProduct,
}
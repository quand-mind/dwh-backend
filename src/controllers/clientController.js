import Client from '../db/Client.js';

const setAllClients = async (req, res) => {
  try {
    const clients = await Client.setAllClients();

    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }

    res.send({count: clients})
    
  } catch (error) {
    
  }
}
const getCountClientsAndSearch = async (req, res) => {
  try {
    const clients = await Client.getCountClientsAndSearch(req.params.string, req.body);

    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }

    res.send({count: clients})
    
  } catch (error) {
    
  }
}
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.getAllClients(req.params.first);

    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }


    res.send({data: clients.length})
    
  } catch (error) {
    
  }
}
const getClientData = async (req, res) => {
  try {
    const client = await Client.getClientData(req.params.orden);

    if (client.error) {
      return res.status(client.code).send({
        status: false,
        message: client.error
      });
    }


    res.send({data: client})
    
  } catch (error) {
    
  }
}
const getDashboardClientData = async (req, res) => {
  try {
    const clients = await Client.getDashboardClientData();

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
const getClients = async (req, res) => {
  try {
    const clients = await Client.getClients(req.params.page);
    // console.log(plans)
    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }
    for (const item of clients) {
      const keys = Object.keys(item)
      for (const key of keys) {
        if (key.charAt(0) == 'i') {
          if(key == 'id') {
            
          } else if(key == 'iestado_civil'){
            item['v'+key] = {values: ['C', 'S', 'N'],format: ['Casado', 'Soltero', 'No especificado']}
          } else if(key == 'isexo') {
            item['v'+key] = {values: ['M','F', 'N'], format:['Masculino', 'Femenino', 'No especificado']}
          } else if(key == 'iestado'){
            item['v'+key] = {values: ['V', 'E'], format:['Venezolano', 'Extranjero']}
          } 
        }
      }
    }
    res.send(clients)
    
  } catch (error) {
    
  }
}
const getAllClientsAndSearch = async (req, res) => {
  try {
    const clients = await Client.getAllClientsAndSearch(req.params.page, req.params.string, req.body);
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
const countClients = async (req, res) => {
  try {
    const clientsCount = await Client.countClients();
    if (clientsCount.error) {
      return res.status(clientsCount.code).send({
        status: false,
        message: clientsCount.error
      });
    }
    
    res.send(clientsCount) 
    
  } catch (error) {
    
  }
}

const getProducts = async (req, res) => {
  try {
    const products = await Client.getProducts(req.params.rif);
    if (products.error) {
      return res.status(products.code).send({
        status: false,
        message: products.error
      });
    }

    for (const product of products) {
      const receipts = await Client.getReceipts(product.xcontrato)
      if (receipts.error) {
        return res.status(receipts.code).send({
          status: false,
          message: receipts.error
        });
      }
      product.receipts = receipts
    }
    
    res.send(products) 
    
  } catch (error) {
    
  }
}


export default {
  getAllClients,
  getClients,
  getClientData,
  countClients,
  getAllClientsAndSearch,
  getCountClientsAndSearch,
  getProducts,
  getDashboardClientData,
  setAllClients
}
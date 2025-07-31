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
const searchWithTable = async (req, res) => {
  try {
    const clients = await Client.searchWithTable(req.params.table);

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
const getSystemData = async (req, res) => {
  try {
    const tableData = await Client.getSystemData(req.params.table);

    if (tableData.error) {
      return res.status(tableData.code).send({
        status: false,
        message: tableData.error
      });
    }


    res.send(tableData)
    
  } catch (error) {
    
  }
}
const getCompanies = async (req, res) => {
  try {
    const companies = await Client.getCompanies();

    if (companies.error) {
      return res.status(companies.code).send({
        status: false,
        message: companies.error
      });
    }
    const companiesF = companies.map(element => {
      return {text: element.xorigen, value: element.corigen, clients_url: element.xtabla_export, products_url: element.xtabla_export_polizas, receipts_url: element.xtabla_export_recibos}
    });

    res.send(companiesF)
    
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

    const observations = await getObservations(client.orden)
    observations.forEach(observation => {
      observation.fobservacion = new Date(observation.fobservacion).toLocaleDateString('en-GB')
    });
    client.observations = observations

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
const getProductsByUser = async (req, res) => {
  try {
    const products = await Client.getProductsByUser(req.params.id, req.params.page, req.params.string, req.body);
    // console.log(plans)
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
const getClients = async (req, res) => {
  try {
    const data = await Client.getClients(req.params.page);
    const clients = data.records
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
    res.send({clients, query: data.query})
    
  } catch (error) {
    
  }
}
const getAllClientsToExport = async (req, res) => {
  try {
    let data = {clientes: null, productos: null, recibos: null}
    data.clientes = await Client.getAllClientsToExport();
    // console.log(plans)
    if (data.clientes.error) {
      return res.status(data.clientes.code).send({
        status: false,
        message: data.clientes.error
      });
    }
    console.log('ya se obtuvieron todos los clientes');
    data.productos = await Client.getAllProducts();

    if (data.productos.error) {
      return res.status(data.productos.code).send({
        status: false,
        message: data.productos.error
      });
    }
    console.log('ya se obtuvieron todos los productos');

    data.recibos = await Client.getAllRecibos();
    
    if (data.recibos.error) {
      return res.status(data.recibos.code).send({
        status: false,
        message: data.recibos.error
      });
    }
    console.log('ya se obtuvieron todos los recibos');
    
    res.send(data)
    
  } catch (error) {
    
  }
}
const getAllClientsAndSearch = async (req, res) => {
  try {
    const data = await Client.getAllClientsAndSearch(req.params.page, req.params.string, req.body);
    const clients = data.records
    if (clients.error) {
      return res.status(clients.code).send({
        status: false,
        message: clients.error
      });
    }
    

    res.send({clients, query: data.query})
    
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
const getProductDetail = async (req, res) => {
  try {
    const productData = await Client.getProductDetail(req.params.id);
    if (productData.error) {
      return res.status(productData.code).send({
        status: false,
        message: productData.error
      });
    }
    
    res.send(productData) 
    
  } catch (error) {
    
  }
}
const getObservations = async (orden) => {
  try {
    const observations = await Client.getObservations(orden);
    if (observations.error) {
      return res.status(observations.code).send({
        status: false,
        message: observations.error
      });
    }
    
    return observations 
    
  } catch (error) {
    
  }
}
const addObservation = async (req, res) => {
  try {
    const observation = await Client.addObservation(req.params.orden, req.body);
    if (observation.error) {
      return res.status(observation.code).send({
        status: false,
        message: observation.error
      });
    }
    
    res.send(observation) 
    
  } catch (error) {
    
  }
}

const getDataUser = async (req, res) => {
  try {
    const data = await Client.getDataUser(req.params.ccanal);
    if (data.error) {
      return res.status(data.code).send({
        status: false,
        message: data.error
      });
    }
    
    res.send(data) 
    
  } catch (error) {
    
  }
}
const exportGestorProductsData = async (req, res) => {
  try {
    const data = await Client.exportGestorProductsData(req.body.cgestor, req.body.filters);
    if (data.error) {
      return res.status(data.code).send({
        status: false,
        message: data.error
      });
    }
    
    res.send(data) 
    
  } catch (error) {
    
  }
}


export default {
  getAllClients,
  getClients,
  getProductsByUser,
  getAllClientsToExport,
  searchWithTable,
  getClientData,
  countClients,
  getAllClientsAndSearch,
  getCountClientsAndSearch,
  getProducts,
  getProductDetail,
  getDashboardClientData,
  addObservation,
  setAllClients,
  getCompanies,
  getSystemData,
  getDataUser,
  exportGestorProductsData
}
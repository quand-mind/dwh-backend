import Client from '../db/Client.js';

const getAllClients = async (req, res) => {
  try {
    const clients = await Client.getAllClients();

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
          } else if(key == 'isexo') {
            item['v'+key] = {values: ['M','F', 'N'], format:['Masculino', 'Femenino', 'No especificado']}
          } else if(key == 'iestado'){
            item['v'+key] = {values: ['V', 'E'], format:['Venezolano', 'Extranjero']}
          } else if(key == 'iestado_civil'){
            item['v'+key] == {values: ['C', 'S'],format: ['Casado', 'Soltero']}
          }
        }
      }
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
          } else if(key == 'isexo') {
            item['v'+key] = {values: ['M','F', 'N'], format:['Masculino', 'Femenino', 'No especificado']}
          } else if(key == 'iestado'){
            item['v'+key] = {values: ['V', 'E'], format:['Venezolano', 'Extranjero']}
          } else if(key == 'iestado_civil'){
            item['v'+key] == {values: ['C', 'S'],format: ['Casado', 'Soltero']}
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
    const clients = await Client.getAllClientsAndSearch(req.params.string);
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


export default {
  getAllClients,
  getClients,
  countClients,
  getAllClientsAndSearch,
}
import Maestros from '../db/Maestros.js';

const getRamos = async (req, res) => {
  try {
    const ramos = await Maestros.getAllRamos();

    const data = ramos.map(item => {
      return {text: item.xdescripcion_l, value: item.cramo}
    })
    data.unshift({text: 'Sin Filtros', value: ''})

    if (ramos.error) {
      return res.status(ramos.code).send({
        status: false,
        message: ramos.error
      });
    }
    res.send(data)
    
  } catch (error) {
    
  }
}


export default {
  getRamos,
}
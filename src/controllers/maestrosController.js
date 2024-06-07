import Maestros from '../db/Maestros.js';

function compare( a, b ) {
  if ( a.text < b.text ){
    return -1;
  }
  if ( a.text > b.text ){
    return 1;
  }
  return 0;
}

const getRamos = async (req, res) => {
  try {
    const ramos = await Maestros.getAllRamos();

    const data = ramos.map(item => {
      return {text: item.xdescripcion_l, value: item.cramo}
    })
    

    data.sort(compare);

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
const getOrigenes = async (req, res) => {
  try {
    const origenes = await Maestros.getOrigenes();

    const data = origenes.map(item => {
      return {text: item.xorigen, value: item.corigen}
    })
    data.unshift({text: 'Sin Filtros', value: ''})

    if (origenes.error) {
      return res.status(origenes.code).send({
        status: false,
        message: origenes.error
      });
    }
    res.send(data)
    
  } catch (error) {
    
  }
}


export default {
  getRamos,
  getOrigenes
}
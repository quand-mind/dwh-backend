import tasaBCV  from './getBcv.cjs';
import Coin from '../db/Coin.js';

const updateMoneda = async (req, res) => {
  try { 
    console.log('Revisando tasas...');
    const data =  await tasaBCV()
    console.log(data);
    
    if(data.message){
      const data2 = await Coin.getMonedaData();
      console.log(data2);
      for (const rate of data2.rates) {
        const monedaMaster = await Coin.updateMaster(rate.value, rate.cmoneda);
        if (monedaMaster.error) {
          throw new Error(monedaMaster.error);
        }
      }
      console.log(data.message);
    } else {
      for (const rate of data.rates) {
        const monedaMaster = await Coin.updateMaster(rate.value, rate.cmoneda);
        if (monedaMaster.error) {
          throw new Error(monedaMaster.error);
        }
      }
    }


    return true;
  } catch (error) {
    console.error('Error en la actualización:', error.message);
    throw error; // Retransmitir el error para un manejo centralizado
  }
}

export default {
  updateMoneda
}
import Reports from '../db/Reports.js';

const gestoresPoliza = async (req, res) => {
  try {
    const report = await Reports.gestoresPoliza(req.body);

    if (report.error) {
      return res.status(report.code).send({
        status: false,
        message: report.error
      });
    }
    res.send(report)
    
  } catch (error) {
    
  }
}

const gestoresRecibos = async (req, res) => {
  try {
    const report = await Reports.gestoresRecibos(req.body);

    if (report.error) {
      return res.status(report.code).send({
        status: false,
        message: report.error
      });
    }
    res.send(report)
    
  } catch (error) {
    
  }
}

export default {
  gestoresPoliza,
  gestoresRecibos
}
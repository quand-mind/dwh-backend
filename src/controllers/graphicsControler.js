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
    const items = await Graphic.getItems(req.body.id);

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
const getItemsFiltered = async (req, res) => {
  try {
    const items = await Graphic.getItemsFiltered(req.body.filters, req.body.filtersInvert, req.body.id);

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
const getFilters = async (req, res) => {
  try {
    const filters = await Graphic.getFilters(req.params.id);

    
    if (filters.error) {
      return res.status(filters.code).send({
        status: false,
        message: filters.error
      });
    }
    const filtersFil = filters.map((filter) => {
      if(filter.xurl) {

        return {
          text: filter.xnombre,
          key: filter.xllave,
          data: [],
          main_key:filter.bprincipal,
          controlValue: '',
          url: filter.xurl,
          binverso: filter.binverso
        }
      } else if(filter.xintervals) {
        const intervals = filter.xintervals.split(',')
        return {
          text: filter.xnombre,
          key: filter.xllave,
          range: [],
          data: [],
          main_key:filter.bprincipal,
          controlValue: '',
          intervals: intervals,
          labelText: filter.xlabel,
          binverso: filter.binverso
        }

      } else if(filter.xdata) {

        return {
          text: filter.xnombre,
          key: filter.xllave,
          data: filter.xdata.split(','),
          main_key:filter.bprincipal,
          controlValue: '',
          labelText: filter.xlabel,
          binverso: filter.binverso
        }
      } else if(filter.bcalendar) {
        return {
          text: filter.xnombre,
          key: filter.xllave,
          bcalendar: filter.bcalendar,
          main_key:filter.bprincipal,
          controlValue: '',
          calendar_value: '',
          labelText: filter.xlabel,
          binverso: filter.binverso
        }
      } else {
        return {
          text: filter.xnombre,
          key: filter.xllave,
          data: [],
          main_key:filter.bprincipal,
          controlValue: '',
          labelText: filter.xlabel,
          binverso: filter.binverso
        }
      }
    })
    
    res.send(filtersFil)
    
  } catch (error) {
    
  }
}

const getDetails = async (req, res) => {
  try {
    const items = await Graphic.getDetails(req.params.id, req.body.filter, req.body.requestVar, req.body.filterInverso);

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
const exportDetails = async (req, res) => {
  try {
    const items = await Graphic.exportDetails(req.body.filter, req.body.requestVar, req.body.id);

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
const exportTotal = async (req, res) => {
  try {
    const items = await Graphic.exportTotal(req.body.requestVar, req.body.id);

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

export default {
  getGraphicsById,
  getItemsFiltered,
  getFilters,
  getItems,
  getDetails,
  exportDetails,
  exportTotal
}
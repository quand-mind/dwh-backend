import Graphic from '../db/Graphic.js';

const getGraphicCompanies = async (req, res) => {
  try {
    const companies = await Graphic.getGraphicCompanies();

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
      // 
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
          binverso: filter.binverso,
          bactivo_grafico: filter.bactivo_grafico,
          bexport_total_key: filter.bexport_total_key
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
          binverso: filter.binverso,
          bactivo_grafico: filter.bactivo_grafico,
          bexport_total_key: filter.bexport_total_key
        }

      } else if(filter.xdata) {

        return {
          text: filter.xnombre,
          key: filter.xllave,
          data: filter.xdata.split(','),
          main_key:filter.bprincipal,
          controlValue: '',
          labelText: filter.xlabel,
          binverso: filter.binverso,
          bactivo_grafico: filter.bactivo_grafico,
          bexport_total_key: filter.bexport_total_key
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
          binverso: filter.binverso,
          bactivo_grafico: filter.bactivo_grafico,
          bexport_total_key: filter.bexport_total_key
        }
      } else {
        return {
          text: filter.xnombre,
          key: filter.xllave,
          data: [],
          main_key:filter.bprincipal,
          controlValue: '',
          labelText: filter.xlabel,
          binverso: filter.binverso,
          bactivo_grafico: filter.bactivo_grafico,
          bexport_total_key: filter.bexport_total_key
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
    
    const graphic = await Graphic.getGraphic(req.body.id)
    if (graphic.error) {
      return res.status(graphic.code).send({
        status: false,
        message: graphic.error
      });
    }
    const itemsTotals = await Graphic.getTotals(req.body.requestVar, graphic.xsqlexporttotal);

    if (itemsTotals.error) {
      return res.status(itemsTotals.code).send({
        status: false,
        message: itemsTotals.error
      });
    }
    let items =  [{label: 'Totales', data: itemsTotals}]
    let itemsDetails = null
    if(graphic.iexporttotal == 2) {

      const itemsLabels = await Graphic.getItemsTotals(graphic.xsqlitems)
      if (itemsLabels.error) {
        return res.status(itemsLabels.code).send({
          status: false,
          message: itemsLabels.error
        });
      }

      const keyFixed = req.body.requestVar.key.split('.')
      let detailsLetter = 'a.'
      if(keyFixed.length > 1) {
        req.body.requestVar.key = keyFixed[1]
        detailsLetter = keyFixed[0] + '.'
      }
    
      itemsDetails = await Graphic.getDetailsTotal(itemsLabels, req.body.requestVar, graphic.xsqlexportdetallestotal, graphic.xllave, detailsLetter)
      if (itemsDetails.error) {
        return res.status(itemsDetails.code).send({
          status: false,
          message: itemsDetails.error
        });
      }
      items = [
        ...items,
        ...itemsDetails
      ]
    }
    // items.reverse()

    res.send({items})
    
  } catch (error) {
    
  }
}

export default {
  getGraphicCompanies,
  getGraphicsById,
  getItemsFiltered,
  getFilters,
  getItems,
  getDetails,
  exportDetails,
  exportTotal
}
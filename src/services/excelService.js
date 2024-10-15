import * as XLSX from 'xlsx';
import { writeFileSync } from "fs";
import Excel from "exceljs";
import axios from 'axios';

const exportToExcel = (selectedList, fileName) =>{
  const ws = XLSX.utils.json_to_sheet(selectedList);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  return XLSX.write(wb, fileName + '.xlsx');
}
const  exportAllToExcel = async (selectedLists, fileName, graphicName) => {
  // console.log(selectedLists);
  const today = new Date()
  const blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  var workbook = new Excel.Workbook();
  for (const selectedList of selectedLists) {
    
    let labelWorksheet = 'DETALLES'
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    if(selectedList.label) {
      labelWorksheet = selectedList.label
    }
    var worksheet = workbook.addWorksheet(selectedList.label, {properties:{tabColor:{argb: randomColor}}});
    worksheet.state = 'visible';
    const columns = []
    const rows = []
    let x = 0
    const widthCols = fitToColumn(selectedList.data);
    for (const element of selectedList.data) {
      let y = 0
      const dataEntries = Object.entries(element)
      let cells = {}      
      for (const entry of dataEntries) {
        const key = entry[0].replaceAll(' ', '').toLowerCase()
        if( x == 0) {
          columns.push({ header: entry[0].toUpperCase(), key: key, width: widthCols[y] + 5 });entry[0].replaceAll(' ', '')
        }
        cells[key] = entry[1]
        y++
      }
      if(Object.keys(cells).length > 0) {
        rows.push(cells)
      }
      x++
    }
    worksheet.columns=columns
    for (const row of rows) {
      worksheet.addRow(row);
    }
    const imageBuffer = await axios.get('https://dwh.lamundialdeseguros.com/assets/img/images%20(1).png', { responseType: 'arraybuffer' });
    const imageId1 = workbook.addImage({
      buffer: imageBuffer.data,
      extension: 'png'
    });
    worksheet.insertRow(1, [])
    worksheet.insertRow(1, ['','',`REPORTE DE ${graphicName.toUpperCase()}`],)
    worksheet.insertRow(1, ['', '', `FECHA DE REPORTE:`, `${today.toLocaleDateString('en-CA')}`])

    worksheet.getRow(1).height = 65
    worksheet.getRow(2).height = 65
    worksheet.getColumn(1).width = 25
    worksheet.getColumn(2).width = 25
    worksheet.getColumn(3).width = 25
    worksheet.getColumn(4).width = 25
    const headerRow = worksheet.getRow(4)
    const lastRow = worksheet.lastRow;
    headerRow.height=25
    headerRow.alignment={vertical: 'middle', horizontal: 'right', wrapText: true}
    headerRow.eachCell({includeEmpty: false }, (cell, rowNumber) => {
      cell.font = {color: { argb: 'FFFFFF' }, scheme: 'major'}
      cell.fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'2A377B'},
      }
    })
    if(lastRow) {
      lastRow.height=25
      lastRow.font = {bold: true}
      let totalCell = lastRow.getCell(1)
      if(typeof totalCell.value  == 'string'){
        totalCell.value = totalCell.value.toUpperCase()
      }
      totalCell.alignment={vertical: 'middle', horizontal: 'left', wrapText: true}
      totalCell.font = {color: { argb: 'FFFFFF' }, bold: true}
      totalCell.fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'2A377B'},
      }
    }
    
    worksheet.mergeCells('A1:B2');
    // worksheet.mergeCells('C1:D1');
    worksheet.mergeCells('C2:D2');
    // expect(worksheet.getCell('C2').style).toBe(worksheet.getCell('D2').style);
    worksheet.getCell('D1').alignment={vertical: 'middle', horizontal: 'center'}
    worksheet.getCell('D1').font={name: 'middle', bold: true}
    worksheet.getCell('C1').alignment={vertical: 'middle', horizontal: 'center'}
    worksheet.getCell('C2').alignment={vertical: 'middle', horizontal: 'center', wrapText: true}
    worksheet.getCell('C2').font={name: 'middle', size: 16, bold: true}
    worksheet.addImage(imageId1, 'A1:B2');
    
  }
  return await workbook.xlsx.writeBuffer()
  workbook.xlsx.writeBuffer().then(data => {
    console.log('aqui',data);
    return data
    // const blob = new Blob([data], { type: blobType }); 
    // FileSaver.saveAs(blob, fileName + '.xlsx');
  });

}

const fitToColumn = (items) => {
  // get maximum character of each column
  let maxItems = []
  items.forEach((element, i) => {
    const keys = Object.keys(element).map((a) => a.toString().length)
    const values = Object.values(element).map((a) => a.toString().length)
    // console.log('values', maxItems);
    if(maxItems.length > 0) {
      let i = 0
      for (const item of maxItems) {
        if (item < keys[i]) {
          maxItems[i] = keys[i]
        } else if (item < values[i]) {
          maxItems[i] = values[i]
        }
        i++
      }
    } else {
      keys.forEach((key, i) => {
        if (key < values[i]) {
          keys[i] = values[i]
        }
      })
      maxItems = keys
    }
  })
  return maxItems
}

export default {
  exportToExcel,
  exportAllToExcel
}
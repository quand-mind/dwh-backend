import * as XLSX from 'xlsx';
import { writeFileSync } from "fs";
import * as Excel from "exceljs";

const exportToExcel = (selectedList, fileName) =>{
  const ws = XLSX.utils.json_to_sheet(selectedList);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  return XLSX.write(wb, fileName + '.xlsx');
}
const  exportAllToExcel = async (selectedLists, fileName) => {
  const blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  var workbook = new Excel.Workbook();
  for (const selectedList of selectedLists) {
    var worksheet = workbook.addWorksheet(selectedList.label, {properties:{tabColor:{argb:'FFC0000'}}});
    worksheet.state = 'visible';
    const columns = []
    const rows = []
    let x = 0
    // console.log(selectedList);
    const widthCols = fitToColumn(selectedList.data);
    for (const element of selectedList.data) {
      let y = 0
      const dataEntries = Object.entries(element)
      let cells = {}      
      for (const entry of dataEntries) {
        const key = entry[0].replaceAll(' ', '').toLowerCase()
        if( x == 0) {
          columns.push({ header: entry[0], key: key, width: widthCols[y] + 3 });entry[0].replaceAll(' ', '')
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
    const fileName = 'https://dwh.lamundialdeseguros.com/assets/img/images%20(1).png'
    const imageId1 = workbook.addImage({
      buffer: imageBuffer.data,
      extension: 'png'
    });
    worksheet.insertRow(1, [])
    worksheet.insertRow(1, [])
    worksheet.insertRow(1, ['','','La Mundial de Seguros'],)
    worksheet.insertRow(1, [])

    worksheet.getRow(1).height = 60
    worksheet.getRow(2).height = 60
    worksheet.getColumn(1).width = 25
    worksheet.getColumn(2).width = 25
    
    worksheet.mergeCells('A1:B2');
    worksheet.mergeCells('C1:D1');
    worksheet.mergeCells('C2:D2');
    // expect(worksheet.getCell('C2').style).toBe(worksheet.getCell('D2').style);
    worksheet.getCell('C2').alignment={vertical: 'middle', horizontal: 'center'}
    worksheet.addImage(imageId1, 'A1:B2');
    
  }
  workbook.xlsx.writeBuffer().then(data => {
    return data
    const blob = new Blob([data], { type: blobType }); 
    FileSaver.saveAs(blob, fileName + '.xlsx');
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
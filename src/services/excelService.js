import * as XLSX from 'xlsx';
import { writeFileSync } from "fs";

const exportToExcel = (selectedList, fileName) =>{
  const ws = XLSX.utils.json_to_sheet(selectedList);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  return XLSX.write(wb, fileName + '.xlsx');
}
const exportAllToExcel = (selectedLists, fileName) => {
  const wb = XLSX.utils.book_new();
  
  for (const selectedList of selectedLists) {
    const ws = XLSX.utils.json_to_sheet(selectedList.data);
    
    ws['!cols'] = fitToColumn(selectedList.data);

    
  }
  const buff = XLSX.write(wb,{type: "buffer", bookType: "xlsx"})
  return buff
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
  return maxItems.map((b) => {return {wch: b}})
}

export default {
  exportToExcel,
  exportAllToExcel
}
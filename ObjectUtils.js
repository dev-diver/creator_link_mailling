function findObjectByValue(objectClass, fieldName, searchValue) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId');
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let sheet = spreadsheet.getSheetByName(objectClass);

  let firstRow = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0]
  let fieldValues = []
  let columnNum = 0;
  for(let i = 0; i<firstRow.length; i++){
    if(firstRow[i] === fieldName){
      columnNum = i+1
    }
    if(firstRow[i] !== "" && firstRow[i] != null){
      fieldValues.push(firstRow[i]);
    }
  }
  if(columnNum == 0){
    throw Error('no fieldName')
  }
  
  let row = 0
  let lastRow = sheet.getLastRow()
  let range = sheet.getRange(1, columnNum, lastRow, 1); // 검색할 열의 전체 범위
  let values = range.getValues(); // 2차원 배열로 값을 가져옵니다.
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] == searchValue) {
      row = i + 1;
      break;
    }
  }
  return createObjectFromRow(sheet,row, fieldValues)
}

function findObjectsByValue(objectClass, fieldName, searchValue) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId');
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let sheet = spreadsheet.getSheetByName(objectClass);

  let firstRow = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0]
  let fieldValues = []
  let columnNum = 0;
  for(let i = 0; i<firstRow.length; i++){
    if(firstRow[i] === fieldName){
      columnNum = i+1
    }
    if(firstRow[i] !== "" && firstRow[i] != null){
      fieldValues.push(firstRow[i]);
    }
  }
  if(columnNum == 0){
    throw Error('no fieldName')
  }
  
  let rows = []
  let lastRow = sheet.getLastRow()
  let range = sheet.getRange(1, columnNum, lastRow, 1); // 검색할 열의 전체 범위
  let values = range.getValues(); // 2차원 배열로 값을 가져옵니다.
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] == searchValue) {
      rows.push(i + 1)
    }
  }
  let objs = []
  for (let row = 0; row <  rows.length; row++){
    let obj = createObjectFromRow(sheet, rows[row], fieldValues)
    objs.push(obj)
  }
  return objs
}

function createObjectFromRow(sheet, row, fieldValues){
  if (row === 0) {
    return null; // 검색된 행이 없는 경우 null 반환
  }
  var rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  let obj = {};
  for (let i = 0; i < fieldValues.length; i++) {
    obj[fieldValues[i]] = rowData[i];
  }
  return obj;
}

function generateNewId(idClass) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var maxId = Number(scriptProperties.getProperty(idClass+'maxId') || 0);
  var newId = maxId + 1;
  scriptProperties.setProperty(idClass+'maxId', newId.toString());
  return newId;
}

function findProductById(productId){
  let product = findObjectByValue("Product", 'id', productId)
  console.log(product)
  let objs = findObjectsByValue("Product_File", 'productId', productId)
  console.log(objs)
  let files = objs.map((record)=>{
    return findObjectByValue("File","id",record.fileId)
  })
  product.files = files
  console.log(product)
  return product
}



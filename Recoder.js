// 스프레드 시트 조회 및 업데이트
function findOrUpdateProduct(productDetail) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);

  let sheet = spreadsheet.getSheetByName('Product');
  let productName = productDetail.name;

  let lastRow = sheet.getLastRow()
  if (lastRow == 0) {
    sheet.appendRow(["id", "name","imgSrc"]);
  }

  found = findObjectByValue('Product','name',productName)

  if (!found) {
    let productId = generateNewId('product')
    sheet.appendRow([productId, productName, productDetail.imgSrc]);
    return {
      ...productDetail,
      id : productId,
      name: productName
    }
  }
  productId = found.id

  return {
    ...found,
    ...productDetail,
  }
}

function saveOrder(orderDetails) {
  // 0) "주문"이라는 활성화된 시트 가져오기
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderSheet = spreadsheet.getSheetByName("Order");

  // 1) 스프레드시트에 제목 행 추가
  if (orderSheet.getLastRow() == 0) { // 스프레드시트가 비어있으면 제목 행 추가
    orderSheet.appendRow(["id", "time","memberName", "memberEmail","delivered"]); // 제목 행
  }

  // 2) 파싱된 정보를 스프레드시트에 추가
  orderSheet.appendRow([
    orderDetails.orderNumber, // 주문번호
    orderDetails.orderDate, // 주문시간
    orderDetails.memberName,
    orderDetails.memberEmail,
    true,
  ]);

}

function saveOrderProduct(orderDetails, productDetails) {
  // 0) "주문"이라는 활성화된 시트 가져오기
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderProductSheet = spreadsheet.getSheetByName("Order_Product")

  if(orderProductSheet.getLastRow() == 0){
    orderProductSheet.appendRow(['id', "orderId", "productId", "optionEmail", "delete"])
  }

  productDetails.forEach((prod)=>{
    let id = generateNewId("order_product")
    orderProductSheet.appendRow([
      id,
      orderDetails.orderNumber,
      prod.id,
      prod.email,
      false
    ])
  })
  
}

function updateDeleteOrderProduct(orderDetails, productDetails, deleteFlag) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let sheet = spreadsheet.getSheetByName("Order_Product");

  let orderId = orderDetails.orderNumber
  const DELETE_COLUMN = 5

  let deleteIds = productDetails.map((prod)=>{
    return prod.id
  })
  console.log("deleteIds", deleteIds, "orderId", orderId)

  let products = findObjectsByValue("Order_Product", "orderId", orderId)

  products = products
  .filter((prod)=>{
    console.log(prod.id)
    return deleteIds.includes(prod.productId)
  })

  products.forEach((prod) => {
    sheet.getRange(prod.row, DELETE_COLUMN).setValue(deleteFlag)
  })

}
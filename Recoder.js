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

function saveOrder(orderDetail) {
  // 0) "주문"이라는 활성화된 시트 가져오기
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderSheet = spreadsheet.getSheetByName("Order");

  // 1) 스프레드시트에 제목 행 추가
  if (orderSheet.getLastRow() == 0) { // 스프레드시트가 비어있으면 제목 행 추가
    orderSheet.appendRow(["id", "time","memberName", "memberEmail","delivered","cancel"]); // 제목 행
  }

  let orderId = orderDetail.orderNumber
  let order = findObjectByValue("Order", "id" , orderId);
  
  if(!order){
    // 2) 파싱된 정보를 스프레드시트에 추가
    orderSheet.appendRow([
      orderDetail.orderNumber, // 주문번호
      orderDetail.orderDate, // 주문시간
      orderDetail.memberName,
      orderDetail.memberEmail,
      true,
      false
    ]);
  }else{
    const CANCEL_COLUMN = 6
    orderSheet.getRange(order.row, CANCEL_COLUMN).setValue(false)
  }
}

function saveOrderProduct(orderDetail, productDetails) {
  // 0) "주문"이라는 활성화된 시트 가져오기
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderProductSheet = spreadsheet.getSheetByName("Order_Product")

  if(orderProductSheet.getLastRow() == 0){
    orderProductSheet.appendRow(['id', "orderId", "productId", "optionEmail", "delete"])
  }

  productDetails.forEach((prod)=>{

    let recordProd = findObjectByValue("order_product","productId",prod.id);
    
    if(recordProd){
      let id = generateNewId("order_product")
      let fail = prod.email==""
      console.log("fail", prod.email ,fail ? true : false)
      orderProductSheet.appendRow([
        id,
        orderDetail.orderNumber,
        prod.id,
        prod.email,
        fail ? true : false
      ])
    }else{
      const DELETE_COLUMN = 5
      orderProductSheet.getRange(recordProd.row, DELETE_COLUMN).setValue(false)
    }

    
  })
  
}

function updateDeleteOrderProduct(orderDetail, productDetails, deleteFlag) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderProductSheet = spreadsheet.getSheetByName("Order_Product");
  let orderSheet = spreadsheet.getSheetByName("Order")

  let orderId = orderDetail.orderNumber
  const DELETE_COLUMN = 5
  const CANCEL_COLUMN = 6

  let deleteIds = productDetails.map((prod)=>{
    return prod.id
  })
  console.log("deleteIds", deleteIds, "orderId", orderId)

  let products = findObjectsByValue("Order_Product", "orderId", orderId)
  let order = findObjectByValue("Order", "id" , orderId);

  if(order){
    orderSheet.getRange(order.row, CANCEL_COLUMN).setValue(deleteFlag)
  }else{
    throw Error("no Order with id:", orderId)
  }
  
  products = products
  .filter((prod)=>{
    console.log(prod.id)
    return deleteIds.includes(prod.productId)
  })

  products.forEach((prod) => {
    orderProductSheet.getRange(prod.row, DELETE_COLUMN).setValue(deleteFlag)
  })
}
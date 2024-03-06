/***** Modeless Dialog ******/
// 주문 데이터 및 관련 회원 및 상품 정보 가져오기
function getOrders(startDate, endDate, filterOption, offsetRow) {

  const pageSize = 10
  let orders = getPaginationedOrders(startDate, endDate, offsetRow, pageSize)
  let data = []
  orders.forEach((order)=>{
    let orderProducts = findObjectsByValue("Order_Product", "orderId", order.id)
    
    data.push([
      order.id,
      order.time,
      order.memberName,
      order.memberEmail,
      "",
      "",
      "",
    ])
    orderProducts.forEach((prod)=>{
      let productName = findObjectByValue("Product", "id", prod.productId).name
      data.push([
        "",
        "",
        "",
        "",
        prod.optionEmail,
        productName,
        prod["delete"]
      ])
    })
   
  })

  return data;
}

function getPaginationedOrders(startDate, endDate, offsetRow, pageSize){
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderSheet = spreadsheet.getSheetByName("Order")

  let filteredOrders = [];
  let startDateTimestamp = Date.parse(startDate);
  let endDateTimestamp = Date.parse(endDate) + (24 * 60 * 60 * 1000);

  let orderFieldValues = makeFieldValues("Order")
  let ordersData = orderSheet.getRange("B:B").getValues();
  let lastRow = orderSheet.getLastRow()
  for (let row = lastRow; row > 1; row--) {
    let timeData = ordersData[row-1][0]
    console.log("startDate", startDateTimestamp, "endDate", endDateTimestamp, "timeData", timeData)
    if (timeData >= startDateTimestamp && timeData <= endDateTimestamp) {
      let order = createObjectFromRow(orderSheet, row, orderFieldValues)
      filteredOrders.push(order);
    }
  }

  let pageOrders = filteredOrders //.slice(offset, offset + pageSize);
  return pageOrders;
}

// 링크 상태 토글
function changeLinkStatus(row, status) {
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId');
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  var sheet = spreadsheet.getSheetByName("Order_Product");
  const CANCEL_COLUMN = 4
  sheet.getRange(row, CANCEL_COLUMN).setValue(status);
  return { linkExpired: status };
}

function formatTimestamp(timestamp) {
  var date = new Date(timestamp);
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 1을 더하고 2자리로 만듭니다.
  var day = ("0" + date.getDate()).slice(-2); // 일은 2자리로 만듭니다.
  var hours = ("0" + date.getHours()).slice(-2); // 시간은 2자리로 만듭니다.
  var minutes = ("0" + date.getMinutes()).slice(-2); // 분은 2자리로 만듭니다.

  var formattedTimestamp = year + "." + month + "." + day + " " + hours + ":" + minutes;
  return formattedTimestamp;
}

/***** Modeless Dialog ******/
// 주문 데이터 및 관련 회원 및 상품 정보 가져오기
function getOrders(startDate, endDate, filterOption, offsetRow) {

  const pageSize = 20
  let orders = getPaginationedOrders(startDate, endDate, filterOption, offsetRow, pageSize)
  let data = []
  orders.forEach((order)=>{
    let orderProducts = findObjectsByValue("Order_Product", "orderId", order.id)
    
    data.push({
      type:"order",

      orderId: order.id,
      orderTime: formatTimestamp(order.time),
      orderMemberName: order.memberName,
      orderMemberEmail: order.memberEmail,

      deliverStatus: order.delivered,
      cancelStatus: order.cancel
  })

    orderProducts.forEach((prod)=>{
      let recordProd = findObjectByValue("Product", "id", prod.productId)
      data.push({
        type: "product",

        orderId: order.id,
        orderTime: formatTimestamp(order.time),
        orderMemberName: order.memberName,
        orderMemberEmail: order.memberEmail,

        optionEmail: prod.optionEmail,
        productName: recordProd.name,
        productImgSrc: recordProd.imgSrc,
        deleteStatus: prod["delete"]
      })
    })
   
  })

  return data;
}

function getPaginationedOrders(startDate, endDate, filterOption, lastSearchedRow, pageSize){
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderSheet = spreadsheet.getSheetByName("Order")

  let filteredOrders = [];
  let startDateTimestamp = Date.parse(startDate);
  let endDateTimestamp = Date.parse(endDate) + (24 * 60 * 60 * 1000);

  let orderFieldValues = makeFieldValues("Order")
  let ordersData = orderSheet.getRange("B:B").getValues();
  let canceledData = orderSheet.getRange("F:F").getValues();
  let startSearchingRow = orderSheet.getLastRow() + 1
  
  if(lastSearchedRow!=0){
    startSearchingRow = lastSearchedRow-1
  }

  function checkFilter(filterOption, value){
    switch (filterOption) {
      case 'total':
        return true;
      case 'share':
        return value==false ? true : false
      case 'cancel':
        return value==true ? true : false
      default:
        return true;
    }
  }

  for (let row = startSearchingRow; row > 1 && filteredOrders.length<pageSize; row--) {
    let timeData = ordersData[row-1][0]
    let canceled = canceledData[row-1][0]
    console.log("startDate", startDateTimestamp, "endDate", endDateTimestamp, "timeData", timeData)
    if (timeData >= startDateTimestamp && timeData <= endDateTimestamp && checkFilter(filterOption, canceled)) {
      let order = createObjectFromRow(orderSheet, row, orderFieldValues)
      filteredOrders.push(order);
    }
  }

  let pageOrders = filteredOrders //.slice(offset, offset + pageSize);
  return pageOrders;
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

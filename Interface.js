/***** Modeless Dialog ******/
// 주문 데이터 가져오기
function getOrdersData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("주문");
  var range = sheet.getDataRange();
  var values = range.getValues();
  var orders = [];
  for (var i = 1; i < values.length; i++) { // 헤더를 제외하고 데이터 읽기
    orders.push({
      row: i + 1,
      memberId: values[i][2],
      productId: values[i][3],
      linkExpired: values[i][7] === true // 만료된 링크 상태
    });
  }
  return orders;
}

// 링크 상태 토글
function toggleLinkStatus(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("주문");
  var currentValue = sheet.getRange(row, 8).getValue(); // 8번째 열이 만료된 링크 상태
  var newValue = !(currentValue === true);
  sheet.getRange(row, 8).setValue(newValue ? true : false);
  return { linkExpired: newValue };
}

// 모드리스 대화상자 표시
function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('cancelWindow')
      .setWidth(600)
      .setHeight(600);
  SpreadsheetApp.getUi().showModelessDialog(html, '주문 상태');
}



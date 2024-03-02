/***** Modeless Dialog ******/
// 주문 데이터 및 관련 회원 및 상품 정보 가져오기
function getOrdersData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = spreadsheet.getSheetByName("주문");
  var membersSheet = spreadsheet.getSheetByName("회원");
  var productsSheet = spreadsheet.getSheetByName("상품");

  var orders = ordersSheet.getDataRange().getValues();
  var members = membersSheet.getDataRange().getValues();
  var products = productsSheet.getDataRange().getValues();

  // 회원 ID와 상품 ID를 기반으로 회원 정보와 상품 정보 매핑
  var memberMap = new Map();
  var productMap = new Map();

  for (var i = 1; i < members.length; i++) { // 헤더 제외
    memberMap.set(members[i][0].toString(), { name: members[i][1], email: members[i][2] });
  }

  for (var j = 1; j < products.length; j++) { // 헤더 제외
    productMap.set(products[j][0].toString(), products[j][1]);
  }

  var orderData = [];
  for (var k = 1; k < orders.length; k++) { // 헤더 및 타이틀 행 제외
    var memberId = orders[k][2].toString();
    var productId = orders[k][3].toString();
    var memberInfo = memberMap.get(memberId);
    var productName = productMap.get(productId);
    if (memberInfo && productName) {
      orderData.push({
        row: k + 1,
        memberName: memberInfo.name,
        memberEmail: memberInfo.email,
        productName: productName,
        linkExpired: orders[k][7] === true
      });
    }
  }

  return orderData;
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
      .setWidth(800)
      .setHeight(600);
  SpreadsheetApp.getUi().showModelessDialog(html, '주문 상태');
}

function findOrUpdateMember(Member) {

  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let sheet = spreadsheet.getSheetByName("Member");

  let lastRow = sheet.getLastRow()
  if (lastRow == 0) {
    sheet.appendRow(["id", "name", "email"]);
  }
  let found = findObjectByValue('Member','email',Member.email)

  if (!found) {
    memberId = generateNewId('member')
    sheet.appendRow([memberId, Member.name, Member.email]);
    return {
      id: memberId,
      name:Member.name,
      email:Member.email
    }
  }
  return found
}

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
  //업데이트

  return {
    ...found,
    ...productDetail,
  } // 객체 반환
}

function saveOrder(orderDetails, memberDetails, productDetails) {
  // 0) "주문"이라는 활성화된 시트 가져오기
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperty('spreadSheetId')
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let sheet = spreadsheet.getSheetByName("Order");

  // 1) 스프레드시트에 제목 행 추가
  if (sheet.getLastRow() == 0) { // 스프레드시트가 비어있으면 제목 행 추가
    sheet.appendRow(["id", "time", "memberId", "productId", "optionEmail", "price", "amount", "delivered"]); // 제목 행
  }

  // 2) 파싱된 정보를 스프레드시트에 추가
  sheet.appendRow([
  orderDetails.orderNumber, // 주문번호
  orderDetails.orderDate, // 주문시간
  memberDetails.id, // 회원 ID
  productDetails.id, // 상품 ID
  productDetails.email, // 옵션 gmail
  productDetails.price, // 주문금액
  productDetails.amount, // 수량
  false
  ]);
}
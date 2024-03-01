// 스프레드 시트 조회 및 업데이트
function addOrUpdateProduct(productDetail) {
  // 0) "상품"이라는 활성화된 시트 가져오기
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('상품');
  var productName = productDetail.productName;
  var optionEmail = productDetail.optionEmail;
  var orderAmount = productDetail.orderAmount;
  var quantity = productDetail.quantity;

  // 1) 스프레드시트에 제목 행 추가
  if (sheet.getLastRow() == 0) { // 스프레드시트가 비어있으면 제목 행 추가
    sheet.appendRow(["ID", "상품명"]); // 제목 행
  }
  
  // 2) 임의로 상품 ID 부여하기
  var data = sheet.getDataRange().getValues(); // 스프레드시트의 모든 데이터를 배열로 가져옴
  var productId;
  var found = false;

  // 2-1) 기존 상품 검색 (상품명으로 확인)
  for (var i = 1; i < data.length; i++) { // 첫 번째 행(제목 행)을 건너뛰고 검색 시작
    if (data[i][1] == productName) { // 두 번째 열(상품명)에서 일치하는 상품명 찾기
      productId = data[i][0];
      found = true;
      break;
    }
  }
  // 2-2) 새로운 상품일 경우
  if (!found) {
    //var maxId = data.reduce((max, row) => Math.max(max, row[0]), 0); // 가장 큰 ID 찾기
    var maxId = data.reduce((max, row) => Math.max(max, Number(row[0]) || 0), 0);
    productId = maxId + 1; // 새 ID 생성
    sheet.appendRow([productId, productName]); // 새 상품 정보를 시트에 추가
  }

  return { productId, productName, optionEmail, orderAmount, quantity }; // 객체 반환
}

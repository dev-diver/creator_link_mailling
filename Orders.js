function saveOrder(orderDetails, memberDetails, productDetails) {
  // 0) "주문"이라는 활성화된 시트 가져오기
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("주문");

  // 1) 스프레드시트에 제목 행 추가
  if (sheet.getLastRow() == 0) { // 스프레드시트가 비어있으면 제목 행 추가
    sheet.appendRow(["주문번호", "주문시간", "회원 ID", "상품 ID", "옵션 gmail", "수량", "주문금액"]); // 제목 행
  }


  // 2) 파싱된 정보를 스프레드시트에 추가
  sheet.appendRow([
  orderDetails.orderNumber, // 주문번호
  orderDetails.orderDate, // 주문시간

  memberDetails.memberId, // 회원 ID

  productDetails.productId, // 상품 ID
  productDetails.optionEmail, // 옵션 gmail
  productDetails.orderAmount, // 수량
  productDetails.quantity, // 주문금액
  ]);
}

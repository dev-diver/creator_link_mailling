// 이메일 본문에서 주문 정보를 파싱하는 함수
function parseOrderDetails(body) {
  var userName = body.match(/고객명 (.+)/) ? body.match(/고객명 (.+)/)[1] : 'N/A';
  var userEmail = body.match(/고객 메일 주소 (.+)/) ? body.match(/고객 메일 주소 (.+)/)[1] : 'N/A';
  var orderNumber = body.match(/주문번호 (\d+)/) ? body.match(/주문번호 (\d+)/)[1] : 'N/A';
  var orderDate = body.match(/주문일자\s+(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2})/) ? body.match(/주문일자\s+(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2})/)[1] : 'N/A';

  return {
    userName : userName,
    userEmail : userEmail,
    orderNumber : orderNumber,
    orderDate : orderDate,
  };
}

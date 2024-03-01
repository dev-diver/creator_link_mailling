function extractProductDetails(body) {
  var productDetails = [];
  
  // 대괄호로 시작하고 대괄호 뒤에 텍스트가 이어지며, 그 뒤에 "옵션 : 이메일", "주문금액", "수량" 형태가 오는 패턴
  var bracketPattern = /\[([^\]]+)\]\s*(.*?)\s*옵션\s*:\s*([^\r\n]+)\s*주문금액\s*([\d,]+)원\s*수량\s*(\d+)개/g;
  
  // "2023"으로 시작하는 패턴, 그 뒤에 "옵션 : 이메일", "주문금액", "수량" 형태가 오는 패턴
  var yearPattern = /^2023\s+(.*?)\s*옵션\s*:\s*([^\r\n]+)\s*주문금액\s*([\d,]+)원\s*수량\s*(\d+)개/gm;

  var match;
  
  // 대괄호 패턴에 일치하는 상품명, 옵션 이메일, 주문금액, 수량 찾기
  while ((match = bracketPattern.exec(body)) !== null) {
    productDetails.push({
      productName: '[' + match[1] + ']' + match[2].trim(),
      optionEmail: match[3].trim(), // 옵션 이메일
      orderAmount: parseInt(match[4].replace(/,/g, ''), 10), // 주문금액, 콤마 제거 후 숫자 변환
      quantity: parseInt(match[5], 10) // 수량 숫자 변환
    });
  }

  // "2023"으로 시작하는 상품명, 옵션 이메일, 주문금액, 수량 찾기
  while ((match = yearPattern.exec(body)) !== null) {
    productDetails.push({
      productName: '2023 '+ match[1].trim(), // 상품명
      optionEmail: match[2].trim(), // 옵션 이메일
      orderAmount: parseInt(match[3].replace(/,/g, ''), 10), // 주문금액, 콤마 제거 후 숫자 변환
      quantity: parseInt(match[4], 10) // 수량 숫자 변환
    });
  }
  return productDetails;
}
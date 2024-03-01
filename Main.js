function importOrders() {
  var threads = GmailApp.search('subject:"주문이 접수되었습니다"');
  threads.forEach(thread => {
    var messages = thread.getMessages();
    messages.forEach(message => {
      var body = message.getPlainBody();

      var orderDetails = parseOrderDetails(body);
      var productDetails = extractProductDetails(body);

      var memberDetails = addOrUpdateMember(orderDetails.userName, orderDetails.userEmail); // Members.gs에서 함수 호출

      var updateProductDetails = productDetails.map(productDetail => addOrUpdateProduct(productDetail)); // Products.gs에서 함수 호출

      updateProductDetails.forEach(updateProductDetail => {
         saveOrder(orderDetails, memberDetails, updateProductDetail); // Orders.gs에서 함수 호출
       });
});
});
}

// function importOrders() {
//   // PropertiesService를 사용하여 마지막으로 처리한 이메일의 시간을 가져옵니다.
//   var scriptProperties = PropertiesService.getScriptProperties();
//   var lastProcessedTime = scriptProperties.getProperty('lastProcessedTime');

//   var threads, processedAllRecentEmails = false;
//   var start = 0;
//   var batchSize = 10; // 한 번에 처리할 이메일 수

//   while (!processedAllRecentEmails) {
//     // Gmail 검색 쿼리를 설정합니다. 마지막 처리 시간 이후의 이메일만 검색합니다.
//     var searchQuery = 'subject:"주문이 접수되었습니다"';
//     threads = GmailApp.search(searchQuery, start, batchSize);

//     for (var i = 0; i < threads.length; i++) {
//       var messages = threads[i].getMessages();
//       for (var j = 0; j < messages.length; j++) {
//         var message = messages[j];
//         var messageDate = message.getDate(); // 메시지의 날짜를 가져옵니다.
//         var messageTime = messageDate.getTime(); // 메시지 날짜의 타임스탬프를 가져옵니다.

//         // 이메일이 lastProcessedTime 이후에 도착했는지 확인합니다.
//         if (!lastProcessedTime || messageTime > parseInt(lastProcessedTime)) {
//           var body = message.getPlainBody();
//           var orderDetails = parseOrderDetails(body);
//           var productDetails = extractProductDetails(body);
//           var memberDetails = addOrUpdateMember(orderDetails.userName, orderDetails.userEmail);
//           productDetails.map(productDetail => addOrUpdateProduct(productDetail))
//             .forEach(updatedProductDetail => {
//               saveOrder(orderDetails, memberDetails, updatedProductDetail);
//             });

//           // 새로운 endTime 업데이트
//           lastProcessedTime = messageTime.toString();
//         } else {
//           // 마지막 처리 시간 이전의 이메일을 만나면 더 이상 검사하지 않고 반복을 종료합니다.
//           processedAllRecentEmails = true;
//           break;
//         }
//       }
//       if (processedAllRecentEmails) break;
//     }

//     // 모든 스레드를 처리했거나 마지막 처리 시간 이전의 이메일을 만났으면 반복을 종료합니다.
//     if (threads.length < batchSize) {
//       processedAllRecentEmails = true;
//     } else {
//       start += batchSize; // 다음 배치를 위해 시작 인덱스 업데이트
//     }
//   }

//   // 처리가 완료된 후, 가장 최근 이메일의 시간을 lastProcessedTime으로 저장
//   scriptProperties.setProperty('lastProcessedTime', lastProcessedTime);
// }

function sendProductFilesToCustomers() {
  var orderSheetName = "주문";
  var productSheetName = "상품";
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var orderSheet = spreadsheet.getSheetByName(orderSheetName);
  var productSheet = spreadsheet.getSheetByName(productSheetName);
  
  var productDataRange = productSheet.getDataRange();
  var productData = productDataRange.getValues();
  var productMap = new Map();
  
  setupDailyTrigger();

  // 상품 테이블에서 상품명 매핑 생성
  for (var i = 1; i < productData.length; i++) { // 제목 행을 제외하고 시작
    var productId = productData[i][0];
    var productName = productData[i][1];
    productMap.set(productId.toString(), productName);
  }

  var orderDataRange = orderSheet.getDataRange();
  var orderData = orderDataRange.getValues();
  orderData.shift(); // 제목 행 제거

  orderData.forEach(function(row) {
    var customerEmail = row[4]; // 옵션 gmail
    var productId = row[3].toString(); // 상품 ID
    
    // 상품 ID가 1인 경우, ID 2부터 7까지의 상품명을 모두 찾아서 처리
    var productIdsToSend = productId === "1" ? ["2", "3", "4", "5", "6", "7"] : [productId];
    
    productIdsToSend.forEach(function(id) {
      var productName = productMap.get(id); // 상품명 찾기
      
      if (!productName) {
        console.log("상품명을 찾을 수 없습니다: 상품 ID " + id);
        return;
      }
      
      var query = "title contains '" + productName + "'";
      var files = DriveApp.searchFiles(query);
      
      while (files.hasNext()) {
        var file = files.next();
        
        // 파일 공개 및 공유 링크 생성
        var fileId = file.getId();
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        var fileUrl = file.getUrl();
        
        // 이메일 발송
        GmailApp.sendEmail(customerEmail, "구매하신 상품 파일입니다: " + productName, 
          "안녕하세요,\n\n구매해주셔서 감사합니다. 아래 링크를 통해 일주일 동안 파일을 다운로드 받으실 수 있습니다.\n\n" + fileUrl + "\n\n감사합니다.",
          {name: '고객 지원'});
      }
    });
  });
}


// 공유된 파일 정보를 저장하는 함수
function saveSharedFileInfo(fileId, customerEmail, productName) {
  // 파일 정보와 공유 해제 시점을 저장합니다.
  // 예시는 스크립트 속성을 사용하지만, 실제 구현에서는 Google 스프레드시트 사용을 고려할 수 있습니다.
  var fileInfo = {
    fileId: fileId,
    unshareTime: new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 현재로부터 7일 후
  };

  // 이전에 저장된 파일 정보를 불러옵니다.
  var fileInfoList = PropertiesService.getScriptProperties().getProperty('sharedFiles');
  fileInfoList = fileInfoList ? JSON.parse(fileInfoList) : [];
  fileInfoList.push(fileInfo);

  // 업데이트된 파일 정보를 저장합니다.
  PropertiesService.getScriptProperties().setProperty('sharedFiles', JSON.stringify(fileInfoList));
}


// 일일 트리거 설정 함수
function setupDailyTrigger() {
  // 이미 설정된 트리거 중 'unshareExpiredFiles' 함수를 호출하는 트리거가 있는지 확인
  var triggers = ScriptApp.getProjectTriggers();
  var isTriggerSet = false;
  
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'unshareExpiredFiles') {
      isTriggerSet = true;
      break;
    }
  }
  
  // 해당 함수를 호출하는 트리거가 없다면 새로운 트리거를 설정
  if (!isTriggerSet) {
    ScriptApp.newTrigger('unshareExpiredFiles')
      .timeBased()
      .everyDays(1)
      .atHour(0) // 매일 자정에 실행
      .inTimezone(Session.getScriptTimeZone()) // 스크립트의 시간대 사용
      .create();
  }
}


// 설정된 시간이 지난 파일의 공유를 해제하는 함수
function unshareExpiredFiles() {
  var now = new Date().getTime();
  var fileInfoList = PropertiesService.getScriptProperties().getProperty('sharedFiles');
  fileInfoList = fileInfoList ? JSON.parse(fileInfoList) : [];

  fileInfoList = fileInfoList.filter(function(fileInfo) {
    if (fileInfo.unshareTime <= now) {
      var file = DriveApp.getFileById(fileInfo.fileId);
      file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
      return false; // 리스트에서 제거
    }
    return true; // 리스트에 유지
  });

  // 업데이트된 리스트를 다시 저장합니다.
  PropertiesService.getScriptProperties().setProperty('sharedFiles', JSON.stringify(fileInfoList));
}

/***** Custom Menu ******/
function deleteCheckedRows() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();
  var lastColumn = sheet.getLastColumn();
  var rows = sheet.getDataRange().getValues();
  var rowsToDelete = [];
  var deletedRowsData = []; // 삭제된 행의 데이터를 저장할 배열 (체크박스 제외)

  // 체크박스가 체크된 행 찾기
  for (var i = rows.length - 1; i >= 0; i--) {
    if (rows[i][lastColumn - 1] === true) { // 마지막 열에 체크박스가 있다고 가정
      rowsToDelete.push(i + 1);
      var rowDataWithoutCheckbox = rows[i].slice(0, -1); // 마지막 체크박스 열 제외
      deletedRowsData.push(rowDataWithoutCheckbox);
    }
  }

  // '취소' 시트에 삭제된 데이터 저장
  var cancelSheet = spreadsheet.getSheetByName('취소');
  if (!cancelSheet) {
    // '취소' 시트가 없으면 새로 생성하고 타이틀 행 추가
    cancelSheet = spreadsheet.insertSheet('취소');
    cancelSheet.appendRow(["주문번호", "주문시간", "회원 ID", "상품 ID", "옵션 gmail", "수량", "주문금액"]);
  }

  // '취소' 시트에 데이터가 이미 있으면 타이틀 행을 확인하고 필요에 따라 추가
  if (cancelSheet.getLastRow() === 1) {
    var titles = cancelSheet.getRange(1, 1, 1, lastColumn - 1).getValues()[0];
    if (titles.join("") === "") { // 타이틀 행이 비어있으면 새로운 타이틀 추가
      cancelSheet.getRange(1, 1, 1, lastColumn - 1).setValues([["주문번호", "주문시간", "회원 ID", "상품 ID", "옵션 gmail", "수량", "주문금액"]]);
    }
  }

  // 삭제된 행의 데이터를 '취소' 시트에 추가
  if (deletedRowsData.length > 0) {
    var startRow = cancelSheet.getLastRow() + 1;
    cancelSheet.getRange(startRow, 1, deletedRowsData.length, deletedRowsData[0].length).setValues(deletedRowsData);
    // 체크박스를 마지막 열에 추가
    cancelSheet.getRange(startRow, lastColumn, deletedRowsData.length).insertCheckboxes();
  }

  // 체크된 행 삭제
  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j] - j); // 이미 삭제된 행 때문에 인덱스 조정 필요
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // 메뉴에 '스크립트' 메뉴 추가 및 '행 삭제' 항목 추가
  ui.createMenu('스크립트')
    .addItem('행 삭제', 'deleteCheckedRows')
    .addToUi();
}

// 체크박스를 특정 행에 추가하는 함수입니다. 이 함수는 데이터를 추가할 때 호출해야 합니다.
function addCheckboxToRow(rowNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(rowNumber, 1).insertCheckboxes();
}

// Custom Menu 사용하려면 아래 내용을 Recorder.gs의 saveOrder 함수 안에 넣어야 함
// 마지막으로 추가된 행 번호를 계산
//  var lastRow = sheet.getLastRow();
  
// 해당 행의 첫 번째 셀에 체크박스 추가
// addCheckboxToRow(lastRow);


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



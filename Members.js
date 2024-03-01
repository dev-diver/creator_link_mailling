function addOrUpdateMember(userName, userEmail) {
  // 0) "회원"이라는 활성화된 시트 가져오기
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("회원");

  // 1) 스프레드시트에 제목 행 추가
  if (sheet.getLastRow() == 0) { // 스프레드시트가 비어있으면 제목 행 추가
    sheet.appendRow(["ID", "회원명", "회원 이메일"]); // 제목 행
  }

  // 2) 임의로 회원 ID 부여하기
  var data = sheet.getDataRange().getValues(); // 스프레드시트의 모든 데이터를 배열로 가져옴
  var memberId;
  var found = false;

  // 2-1) 기존 회원 검색 (회원 이메일로 확인)
  for (var i = 1; i < data.length; i++) { // 첫 번째 행(제목 행)을 건너뛰고 검색 시작
    if (data[i][2] == userEmail) { // 세 번째 열(회원 이메일)에서 일치하는 이메일 찾기
      memberId = data[i][0];
      found = true;
      break;
    }
  }

  // 2-2) 새로운 회원일 경우
  if (!found) {
    // var maxId = data.reduce((max, row) => Math.max(max, row[0]), 0); // 가장 큰 ID 찾기
    var maxId = data.reduce((max, row) => Math.max(max, Number(row[0]) || 0), 0);
    memberId = maxId + 1; // 새 ID 생성
    sheet.appendRow([memberId, userName, userEmail]); // 새 회원 정보를 시트에 추가
  } 

  return { memberId, userName, userEmail }; // 객체 반환
}

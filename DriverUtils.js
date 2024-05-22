function shareFiles(driveId, email) {
  let driveObject = getDriveObject(driveId);
  if (!driveObject) {
    console.error("유효하지 않은 파일 또는 폴더 ID입니다.");
    return "";
  }

  try {
    driveObject.addViewer(email);
    return driveObject.getUrl();
  } catch (e) {
    console.error("공유 오류 발생:", e.toString());
    return "";
  }
}

function unshareExpiredFiles(driveId, email) {
  let driveObject = getDriveObject(driveId);
  if (!driveObject) {
    console.error("유효하지 않은 파일 또는 폴더 ID입니다.");
    return;
  }

  try {
    driveObject.removeViewer(email);
  } catch (e) {
    console.error("공유 해제 오류 발생:", e.toString());
  }
}

function getDriveObject(driveId) {
  let result;
  try {
    return (result = DriveApp.getFileById(driveId));
  } catch (e) {
    try {
      result = DriveApp.getFolderById(driveId);
    } catch (e) {
      console.error("공유 오류 발생:", e.toString());
    }
  }
  return result;
}

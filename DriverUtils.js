function shareFiles(driveFileId, email) {
  try {
    let file = DriveApp.getFileById(driveFileId)
    file.addViewer(email)
    let fileUrl = file.getUrl()
    return fileUrl
  } catch (e){
    console.error('공유 오류 발생:', e.toString())
  }
  return ""
}

function unshareExpiredFiles(driveFileId, email) {
  try {
    let file = DriveApp.getFileById(driveFileId);
    file.removeViewer(email);
  } catch (e) {
    console.error('공유 해제 오류 발생:', e.toString());
  }
}
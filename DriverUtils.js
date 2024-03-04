function shareFiles(driveFileId, email) {
  let file = DriveApp.getFileById(driveFileId)
  file.addViewer(email)
  let fileUrl = file.getUrl()
  return fileUrl
}

function unshareExpiredFiles(driveFileId, email) {
  try {
    let file = DriveApp.getFileById(driveFileId);
    file.removeViewer(email);
  } catch (e) {
    console.error('오류 발생:', e.toString());
  }
}
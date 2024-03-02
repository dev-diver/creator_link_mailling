function shareFiles(driveFileId, email) {
  
  let file = DriveApp.getFileById(driveFileId)
  file.addViewer(email)
  let fileUrl = file.getUrl()
  return fileUrl
}

function unshareExpiredFiles(driveFileId, email) {
  let file = DriveApp.getFileById(driveFileId)
  file.removeViewer(email)
}
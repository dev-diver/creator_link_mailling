function doGet(){
  return HtmlService.createHtmlOutputFromFile('cancelWindow')
}

// 모드리스 대화상자 표시
function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('cancelWindow')
      .setWidth(800)
      .setHeight(600);
  SpreadsheetApp.getUi().showModelessDialog(html, '주문 상태');
}

function importOrders() {

  let scriptProperties = PropertiesService.getScriptProperties();
  let recentMailId = ""//scriptProperties.getProperty('recentMailId')

  let query = "from:(aaf) subject:`주문이 접수되었습니다.`";
  let pageToken;
  let flag = false;
  let firstMsgId = ''
  do{
    let threadList = Gmail.Users.Messages.list('me', {
      q: query,
      pageToken:pageToken,
      maxResults:1
    });
    if(threadList.messages.length > 0){
      if(!firstMsgId){
        firstMsgId = threadList.messages[0].id
      }
      threadList.messages.forEach((msg,i)=>{
        if(flag && msg.id==recentMailId){
          flag=true
          return;
        }
        let message = GmailApp.getMessageById(msg.id);
        var plainBody = message.getPlainBody();
        var htmlBody = message.getBody();
        var mailRoot = getMailRoot(htmlBody);
        var orderDetails = parseOrderDetails(plainBody); //memberName,memberEmail,orderNumber,orderDate,
        var productDetails = parseProductDetails(mailRoot);
        var updateProductDetails = productDetails.map(productDetail => findOrUpdateProduct(productDetail)); // Products.gs에서 함수 호출
        
        deliverOrder(orderDetails,updateProductDetails)
        saveOrder(orderDetails)
        saveOrderProduct(orderDetails, updateProductDetails); // Orders.gs에서 함수 호출
      })
    }
    flag = true //임시
    pageToken = threadList.nextPageToken;
  } while(!flag && pageToken);
  scriptProperties.setProperty('recentMailId', firstMsgId)
}

function importCancelOrders() {

  let scriptProperties = PropertiesService.getScriptProperties();
  let recentMailId = ""//scriptProperties.getProperty('recentCanceledMailId')

  let query = "from:(aaf) subject:`취소 요청이 접수되었습니다.`";
  let pageToken;
  let flag = false;
  let firstMsgId = ''
  do{
    let threadList = Gmail.Users.Messages.list('me', {
      q: query,
      pageToken:pageToken,
      maxResults:1
    });
    if(threadList.messages.length > 0){
      if(!firstMsgId){
        firstMsgId = threadList.messages[0].id
      }
      threadList.messages.forEach((msg,i)=>{
        if(flag && msg.id==recentMailId){
          flag = true
          return;
        }
        let message = GmailApp.getMessageById(msg.id);
        var plainBody = message.getPlainBody();
        var htmlBody = message.getBody();
        var mailRoot = getMailRoot(htmlBody);
        var orderDetails = parseOrderDetails(plainBody);
        var productDetails = parseProductDetails(mailRoot);

        var updateProductDetails = productDetails.map(productDetail => findOrUpdateProduct(productDetail)); // Products.gs에서 함수 호출
        cancelOrder(orderDetails,updateProductDetails)
        updateDeleteOrderProduct(orderDetails, updateProductDetails, true); // Orders.gs에서 함수 호출
      })
    }
    flag = true //임시
    pageToken = threadList.nextPageToken;
  } while(!flag && pageToken);
  scriptProperties.setProperty('recentCanceledMailId', firstMsgId)
}

function deliverOrder(orderDetails, productDetails){

  let products = productDetails.map((prod)=>{
    let product = findProductById(prod.id)
    let files = product.files.map((file)=>{
      let url = shareFiles(file.driveId, prod.email)
      return {
        ...file,
        url
      }
    })
    
    product = {
      ...prod,
      ...product,
      files:files
    }
    console.log("product", product)
    return product
  })

  let subject = "구매하신 상품입니다."
  let template = HtmlService.createTemplateFromFile('emailTemplate')
  template.order = orderDetails
  template.products = products;
  template.cancel = false;

  let htmlBody = template.evaluate().getContent();
  console.log("send Email: ", orderDetails.memberEmail)
  GmailApp.sendEmail(orderDetails.memberEmail, subject,"",{
    name: 'AAF',
    htmlBody: htmlBody
  });
}

function cancelOrder(orderDetails, productDetails){

  let products = productDetails.map((prod)=>{
    let product = findProductById(prod.id)
    let files = product.files.map((file)=>{
      let url = unshareExpiredFiles(file.driveId, prod.email)
      return {
        ...file,
        url
      }
    })

    product = {
      ...prod,
      ...product,
      files:files
    }
    product.files = files
    return product
  })

  let subject = "취소하신 상품입니다."
  let template = HtmlService.createTemplateFromFile('emailTemplate')
  template.order = orderDetails
  template.products = products;
  template.cancel = true;

  let htmlBody = template.evaluate().getContent();
  GmailApp.sendEmail(orderDetails.memberEmail, subject,"",{
    name: 'AAF',
    htmlBody: htmlBody
  });
}


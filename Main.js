function importOrders() {

  let scriptProperties = PropertiesService.getScriptProperties();
  let recentMailId = ""//scriptProperties.getPropery('recentMailId')

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
        threadList.messages[0].id
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
        var orderDetails = parseOrderDetails(plainBody);
        var productDetails = parseProductDetails(mailRoot);
        
        let Member = {
          name: orderDetails.memberName,
          email: orderDetails.memberEmail
        }
        
        var memberDetails = findOrUpdateMember(Member); // Members.gs에서 함수 호출
        var updateProductDetails = productDetails.map(productDetail => findOrUpdateProduct(productDetail)); // Products.gs에서 함수 호출
        deliverOrder(orderDetails,updateProductDetails)
        updateProductDetails.forEach(updateProductDetail => {
          saveOrder(orderDetails, memberDetails, updateProductDetail); // Orders.gs에서 함수 호출
        });
      })
    }
    flag = true //임시
    pageToken = threadList.nextPageToken;
  } while(!flag && pageToken);
  scriptProperties.setProperty('recentMailId', firstMsgId)
}

function deliverOrders(){
  let scriptProperties = PropertiesService.getScriptProperties();
  let spreadSheetId = scriptProperties.getProperties('spreadSheetId');
  let spreadsheet = SpreadsheetApp.openById(spreadSheetId);
  let orderSheetName = "Order";
  let orderSheet = spreadsheet.getSheetByName(orderSheetName);

  const productIdColumn = 4
  const emailColumn = 5
  const deliverColumn = 7

  let lastRow = orderSheet.getLastRow()
  var orders = [];
  for (var row = 2; row < lastRow; row++) {
    let range = orderSheet.getRange(row,1)
    if (range.offset(0,deliverColumn-1).getValue() === true) {
      break;
    }
    let order = {
      email: range.offset(0,emailColumn-1).getValue(),
      productId : range.offset(0,productIdColumn-1).getValue(),
    }
    orders.push(order);
  }

  orders.forEach(function(order) {
    let email = order.email
    let productId = order.productId
    let product = findProductById(productId)
    let files = product.files.map((file)=>{
      let url = shareFiles(fileUrl, email)
      return {
        ...file,
        url
      }
    })

    let subject = "구매하신 상품입니다."
    let template = HtmlService.createTemplateFromFile('emailTemplate')
    template.product = product;
    template.files = files;

    let htmlBody = template.evaluate().getContent();

    GmailApp.sendEmail(email, subject,"",{
      name: 'AAF',
      htmlBody: htmlBody
    });
    
  });
}

function deliverOrder(orderDetails, productDetails){

  //let emails = new Set();
  let products = productDetails.map((prod)=>{
    let product = findProductById(prod.id)
    let files = product.files.map((file)=>{
      let url = shareFiles(file.driveId, prod.email)
      return {
        ...file,
        url
      }
    })
    product.files = files
    return product
  })

  let subject = "구매하신 상품입니다."
  let template = HtmlService.createTemplateFromFile('emailTemplate')
  template.order = orderDetails
  template.products = products;

  let htmlBody = template.evaluate().getContent();
  GmailApp.sendEmail(orderDetails.memberEmail, subject,"",{
    name: 'AAF',
    htmlBody: htmlBody
  });
}














function doGet() {
  return HtmlService.createHtmlOutputFromFile("cancelWindow");
}

// 모드리스 대화상자 표시
function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile("cancelWindow")
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModelessDialog(html, "주문 상태");
}

function processOrderes() {
  let scriptProperties = PropertiesService.getScriptProperties();
  let recentMessageId = scriptProperties.getProperty("recentMessageId");
  console.log("recentMessageId:", recentMessageId);

  recentMessageId = importOrders(recentMessageId);

  console.log("save recentMessageId:", recentMessageId);
  scriptProperties.setProperty("recentMessageId", recentMessageId);
}

function processCancelOrderes() {
  let scriptProperties = PropertiesService.getScriptProperties();
  let recentCancelMessageId = scriptProperties.getProperty(
    "recentCancelMessageId"
  );
  console.log("recentMessageId:", recentCancelMessageId);

  recentCancelMessageId = importCancelOrders(recentCancelMessageId);

  console.log("save recentMessageId:", recentCancelMessageId);
  scriptProperties.setProperty("recentCancelMessageId", recentCancelMessageId);
}

function importOrders(recentMessageId) {
  let query = "from:(aaf) subject:`주문이 접수되었습니다.`";
  let pageToken;
  let flag = false;
  let firstMessageId = "";
  const email = getMailAddress();

  tasks = [];
  do {
    let threadList = Gmail.Users.Messages.list(email, {
      q: query,
      pageToken: pageToken,
      maxResults: processingMailAmount(),
    });
    console.log(threadList);
    // return recentMessageId;
    if (threadList.messages.length > 0) {
      if (!firstMessageId) {
        firstMessageId = threadList.messages[0].id;
      }
      threadList.messages.forEach((msg, i) => {
        if (flag || msg.id == recentMessageId) {
          flag = true;
          return;
        }
        let message = GmailApp.getMessageById(msg.id);
        var plainBody = message.getPlainBody();
        var htmlBody = message.getBody();
        var mailRoot = getMailRoot(htmlBody);
        var orderDetail = parseOrderDetail(plainBody); //memberName,memberEmail,orderNumber,orderDate,
        var productDetails = parseProductDetails(mailRoot);
        tasks.push({ orderDetail, productDetails });
      });
    }
    // flag = true; //임시
    pageToken = threadList.nextPageToken;
  } while (!flag && pageToken);
  tasks.reverse().forEach((task) => {
    deliverAndSaveOrder(task.orderDetail, task.productDetails);
  });
  return firstMessageId;
}

function importCancelOrders(recentCancelMessageId) {
  let query = "from:(aaf) subject:`취소 요청이 접수되었습니다.`";
  let pageToken;
  let flag = false;
  let firstMessageId = "";
  const email = getMailAddress();

  do {
    let threadList = Gmail.Users.Messages.list(email, {
      q: query,
      pageToken: pageToken,
      maxResults: 1,
    });
    if (threadList.messages.length > 0) {
      if (!firstMessageId) {
        firstMessageId = threadList.messages[0].id;
      }
      threadList.messages.forEach((msg, i) => {
        if (flag || msg.id == recentCancelMessageId) {
          flag = true;
          return;
        }
        let message = GmailApp.getMessageById(msg.id);
        var plainBody = message.getPlainBody();
        var htmlBody = message.getBody();
        var mailRoot = getMailRoot(htmlBody);
        var orderDetail = parseOrderDetail(plainBody);
        var productDetails = parseProductDetails(mailRoot);

        deliverAndSaveCancelOrder(orderDetail, productDetails);
      });
    }
    // flag = true; //임시
    pageToken = threadList.nextPageToken;
  } while (!flag && pageToken);

  return firstMessageId;
}

function deliverAndSaveOrder(orderDetail, productDetails) {
  try {
    let updateProductDetails = productDetails.map((productDetail) =>
      findOrUpdateProduct(productDetail)
    ); // Products.gs에서 함수 호출
    updateProductDetails = deliverOrder(orderDetail, updateProductDetails);
    saveOrder(orderDetail);
    saveOrderProduct(orderDetail, updateProductDetails); // Orders.gs에서 함수 호출
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function deliverAndSaveCancelOrder(orderDetail, productDetails) {
  try {
    let updateProductDetails = productDetails.map((productDetail) =>
      findOrUpdateProduct(productDetail)
    ); // Products.gs에서 함수 호출
    cancelOrder(orderDetail, updateProductDetails);
    updateDeleteOrderProduct(orderDetail, updateProductDetails, true); // Orders.gs에서 함수 호출
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function deliverAndRecoverOrder(orderDetail, productDetails) {
  try {
    let updateProductDetails = productDetails.map((productDetail) =>
      findOrUpdateProduct(productDetail)
    ); // Products.gs에서 함수 호출
    updateProductDetails = deliverOrder(orderDetail, updateProductDetails);
    recoverOrderProduct(orderDetail, updateProductDetails); // Orders.gs에서 함수 호출
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function deliverOrder(orderDetail, productDetails) {
  let products = productDetails.map((prod) => {
    let product = findProductById(prod.id);
    let files = product.files.map((file) => {
      let url = shareFiles(file.driveId, prod.email);
      return {
        ...file,
        url,
      };
    });

    //file 전송 에러에 대한 처리
    product = {
      ...prod,
      ...product,
      files: files,
    };
    console.log("product", product);
    return product;
  });

  let subject = "구매하신 상품입니다.";
  let template = HtmlService.createTemplateFromFile("emailTemplate");
  template.order = orderDetail;
  template.products = products;
  template.cancel = false;

  let htmlBody = template.evaluate().getContent();
  console.log("send Email: ", orderDetail.memberEmail);
  GmailApp.sendEmail(orderDetail.memberEmail, subject, "", {
    name: "AAF",
    htmlBody: htmlBody,
  });
  return products;
}

function cancelOrder(orderDetails, productDetails) {
  let products = productDetails.map((prod) => {
    let product = findProductById(prod.id);
    let files = product.files.map((file) => {
      let url = unshareExpiredFiles(file.driveId, prod.email);
      return {
        ...file,
        url,
      };
    });

    product = {
      ...prod,
      ...product,
      files: files,
    };
    product.files = files;
    return product;
  });

  let subject = "취소하신 상품입니다.";
  let template = HtmlService.createTemplateFromFile("emailTemplate");
  template.order = orderDetails;
  template.products = products;
  template.cancel = true;

  let htmlBody = template.evaluate().getContent();
  GmailApp.sendEmail(orderDetails.memberEmail, subject, "", {
    name: "AAF",
    htmlBody: htmlBody,
  });
}

function processingMailAmount() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const mailAmount = scriptProperties.getProperty("mailAmount");
  return mailAmount;
}

function getMailAddress() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const mailAddress = scriptProperties.getProperty("mailAddress");
  return mailAddress;
}

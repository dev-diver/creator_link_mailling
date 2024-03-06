function parseOrderDetails(plainBody) {
  let memberName = plainBody.match(/고객명 (.+)/) ? plainBody.match(/고객명 (.+)/)[1] : 'N/A';
  let memberEmail = plainBody.match(/고객 메일 주소 (.+)/) ? plainBody.match(/고객 메일 주소 (.+)/)[1] : 'N/A';
  let orderNumber = plainBody.match(/주문번호 (\d+)/) ? plainBody.match(/주문번호 (\d+)/)[1] : 'N/A';
  let orderDate = plainBody.match(/주문일자\s+(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2})/) ? plainBody.match(/주문일자\s+(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2})/)[1] : 'N/A';
  let date = new Date(orderDate).getTime()
  console.log("date", date)
  return {
    memberName,
    memberEmail,
    orderNumber,
    orderDate: date
  };
}

function parseProductDetails(mailRoot) {
  let productDetails = [];
  let orderList = mailRoot.children('div').eq(1);
  let orders = orderList.children('div');
  for(let i=0; i<orders.length-1; i++){
    let order = orders.eq(i);

    let imgSrc = order.children('div').eq(0).children('div').eq(0).children('img').eq(0).attr('src')

    let descTag = order.children('div').eq(0).children('div').eq(1)
    let name = descTag.children('p').eq(0).text().trim()
    let email = descTag.children('p').eq(1).text().split(":")[1].trim()

    let price = order.children('div').eq(1).children('div').eq(1).text().split("원")[0].trim()
    price = parseInt(price.replace(/,/g, ''));
    let amount = order.children('div').eq(2).children('div').eq(1).text().split("개")[0].trim()
    amount = parseInt(amount.replace(/,/g, ''));

    let details = { 
      name, 
      imgSrc,
      email, 
      price, 
      amount
    }
    console.log(details)
    productDetails.push(details)
  }
  return productDetails;
}

function getMailRoot(htmlBody){
  const $ = Cheerio.load(htmlBody)
  let parent = $('table').first().parent()
  return parent
}
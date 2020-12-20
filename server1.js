const http = require("http");

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write("<h1>Sanghun Lee First Server!</h1>");
    res.end("<p>Hello Server</p>");
  })
  .listen(8080, () => {
    console.log("8080번 포트에서 서버 대기중!!");
  });
//https module 웹서버에 SSl암호화를 추가한다.
//GET 이나 POST요청을 할 때 오가는 데이터를 암호화해서 중간에 다른사람이 요청을 가로채더라도 내용을 확인할 수 없게 한다.
//요즘은 로그인이나 결제가 필요한 창에서 https 적용이 필수가 되는 추세이다.

//https를 사용하기 위해서는 암호화를 적용하는 만큼 그것을 인증해줄 수 있는 기관에서 구입해야하며 Lets's Encrypt같은 기관에서 무료로 발급해주기도 한다.

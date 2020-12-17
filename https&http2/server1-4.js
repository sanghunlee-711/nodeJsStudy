const http2 = require("http2");
const fs = require("fs");

//http/1.1의 baseline방식에 비해 훨씬 효율적인 multiplexting 방법을 가졌다.
// 1.1은 한번 통신에 한번의 응답으로 하나씩 파일을 가져왔다면 2버전은 여러개의 파일을 한번에 가져올 수 있는 것이라 생각하자.

http2
  .createSecureServer(
    {
      cert: fs.readFileSync("도메인 인증서 경로"),
      key: fs.readFileSync("도메인 비밀키 경로"),
      ca: [
        fs.readFileSync("상위 인증서 경로"),
        fs.readFileSync("상위 인증서 경로"),
      ],
    },
    (req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write("<h1>http2Test</h1>");
      res.end("<p>test End</p>");
    }
  )
  .listen(443, () => {
    console.log("443번 포트에서 대기중입니당 :)");
  });

const http = require("http");
const fs = require("fs").promises;
const url = require("url");
const qs = require("querystring");

const parseCookies = (cookie = "") =>
  //쿠키는 원래 문자열인데 이걸 쉽게 사용하기 위해 js 객체 형태로 바꾸는 것

  cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});

http
  .createServer(async (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    console.log("cookies", cookies);

    //주소가 /login으로 시작할 경우 url 과 querystring모듈로 각각 주소와 주소에 딸려오는 query를 분석하는 코드이다.
    //주소 로그인으로 시작시(/login)
    if (req.url.startsWith("/login")) {
      const { query } = url.parse(req.url);
      const { name } = qs.parse(query);
      const expires = new Date();

      //쿠키 유효시간 현재시간 +5로 연장하는 설정
      expires.setMinutes(expires.getMinutes() + 5);
      // name변수를 encodeURIComponent 메서드로 인코딩했다.
      //Set-Cookie의 값으로는 제한된 ASCII코드만 들어가야 하므로 줄바꿈을 넣으면 안된다앙
      res.writeHead(302, {
        Location: "/",
        "Set-Cookie": `name=${encodeURIComponent(
          name
        )}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
      });
      res.end();

      //그 외의 경우(/로 접속했을 때 등), 쿠키가 있는지 없는지를 확인합니다 쿠키가 없다면 로그인 할 수 있는 페이지를 보낸다
      // 처음 받문한 경우는 쿠기가 없으므로 cooki2.html이 전송된다. 쿠키가 있다면 로그인한 상태로 간주하여 인사를 보낸다!
      //name이라는 쿠키가 있을경우
    } else if (cookies.name) {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`${cookies.name}님 안녕용`);
    } else {
      try {
        const data = await fs.readFile("./cookie2.html");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(err.message);
      }
    }
  })
  .listen(8084, () => {
    console.log("8084번 포트에서 서버대기중입니다!");
  });

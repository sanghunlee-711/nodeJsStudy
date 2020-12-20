const http = require("http");
const { sendPosts } = require("./sendPosts");

const server = http
  .createServer((req, res) => {
    const { url, method } = req;
    console.log("request recevied");

    res.setHeader("Content-type", "application/json");

    if (url === "/") res.end(JSON.stringify({ message: "/endpoint" }));
    if (url === "/signup" && method === "POST") handleSignUp(req, res);
    if (url === "/login" && method === "POST") handleLogin(req, res);
    if (url === "/products" && method === "GET") sendPosts(res);

    res.end(
      JSON.stringify({
        message: `this response answers to every requests with${url}`,
      })
    );
  })
  .listen(3000, () => {
    console.log("3000번포트 대기중");
  });

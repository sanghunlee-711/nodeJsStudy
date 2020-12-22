var express = require("express");
var app = express();
var fs = require("fs");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var template = require("./lib/template.js");
const { response } = require("express");
var qs = require("querystring");
let bodyParser = require("body-parser");
let compression = require("compression");

//thirpary library(bodyparser) 써보기
app.use(express.static("public")); //public directory안에서 static파일을 찾는 것이다. 정적파일 사용가능하게 하는 설정
app.use(bodyParser.urlencoded({ extended: false })); // bodyparser가 들어오는 미들웨어를 표현하는 식임
app.use(compression()); // 파일 전송시 압축과 해제를 도와주는 미들웨어
app.get("*", function (request, response, next) {
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist; //request에 list프로퍼티를 셋팅한것임
    next(); // 그 다음 호출되어야 할 미들웨어가 담겨 있다.
  });
}); // get방식일때만 해당 미들웨어 사용하게 됨. 그러니까 라우트라고 생각했던곳에서의 두번째 인자인 콜백함수는 사실상 미들웨어 였다 이말이다 .. ㅇㅁㅇ...

let myLogger = function (req, res, next) {
  console.log("LOGGED");
  next();
};

//routing-> path 마다 응답 바꿔주는거임
// if문을 통해 실행했던것을 get과 send를 통해서 구현하는 것임
//if문 중첩을 피할 수 있다 :)
app.get("/", (request, response) => {
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
    <img src = "http://localhost:3000/images/hello.jpg"  alt ="mainImage" style = "width: 300px; display: block; margin: 10px 0 ;">
    `,
    `<a href="/create">create</a>`
  );
  response.send(html);
});

// 상세보기 구현
app.get("/page/:pageId", function (request, response, next) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    if (err) {
      next(err);
    } else {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"],
      });
      var list = template.list(request.list);
      var html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
            <a href="/update/${sanitizedTitle}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
      );
      response.send(html);
    }
  });
});

//생성기능
app.get("/create", (req, res) => {
  var title = "WEB - create";
  var list = template.list(req.list);
  //form action="/create_process" 은 최상위 디렉토리에서 create_process경로를 찾는것이다 '/'를 기억하자 :)
  var html = template.HTML(
    title,
    list,
    `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `,
    ""
  );
  res.send(html);
});

app.post("/create_process", (request, response) => {
  // before use bodyparser
  /*
    var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      response.writeHead(302, { Location: `/?id=${title}` });
      response.end();
    });
  });
  */

  console.log(request.list);
  let post = request.body; // use middleware(body parser)
  let title = post.title;
  let description = post.description;

  fs.writeFile(`data/${title}`, description, "utf8", (err) => {
    response.writeHead(302, { Location: `/?id =${title}` });
    response.end();
  });
});

//update
app.get("/update/:pageId", (request, response) => {
  let filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    var title = filteredId;
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
    );
    response.send(html);
  });
});

app.post("/update_process", (request, response) => {
  let post = request.body; // use body parser
  let id = post.id;
  let title = post.title;
  let description = post.description;

  fs.rename(`data/${id}`, `data/${title}`, (error) => {
    fs.writeFile(`data/${title}`, description, "utf8", (err) => {
      response.redirect(`/?id=${title}`);
    });
  });
});

//delete
app.post("/delete_process", (request, response) => {
  let post = request.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (error) => {
    response.redirect("/");
  });
});

//route paramter를 통해 값 전달

// app.get("/", function (req, res) {
//   return res.send("Hello World!");
// });

//미들웨어는 순차적으로 처리되기 때문에 더 이상 실행되지 못하고 마지막에 와서 404status를 보내기 위해 제일 하단부에 위치시킨다.
app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

// 에러핸들링을 위한 미들웨어는 네개의 인자를 받는다 => epxress에서는 네개의 인자를 받으면 에러핸들링을 하는 미들웨어로 정의된다
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(404).send("Something broke!");
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`);
});

///Under code is written without 'express';
/*
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template.js");
var path = require("path");

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = template.list(filelist);
        var html = template.HTML(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir("./data", function (error, filelist) {
        var filteredId = path.parse(queryData.id).base; // 경로 보안화 시킴 ../같은거 .. 해놓지 않으면 경로타고 다 볼 수 있기 때문
        fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            ` <a href="/create">create</a>
                <a href="/update?id=${title}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (error, filelist) {
      var title = "WEB - create";
      var list = template.list(filelist);
      var html = template.HTML(
        title,
        list,
        `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
        ""
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", function (err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function (error, filelist) {
      fs.readFile(`data/${queryData.id}`, "utf8", function (err, description) {
        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.HTML(
          title,
          list,
          `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, "utf8", function (err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, function (error) {
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000, () => {
  console.log("port 3000");
});

//출력보안은 추후에 보자

*/

let express = require("express");
let router = express.Router(); //express 모듈의 Router메서드 호출하여 router객체를 변수에 담음
var path = require("path");
var fs = require("fs");
var sanitizeHtml = require("sanitize-html");
var template = require("../lib/template.js");

//생성기능
router.get("/create", (req, res) => {
  var title = "WEB - create";
  var list = template.list(req.list);
  //form action="/create_process" 은 최상위 디렉토리에서 create_process경로를 찾는것이다 '/'를 기억하자 :)
  var html = template.HTML(
    title,
    list,
    `
        <form action="/topic/create_process" method="post">
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

router.post("/create_process", (request, response) => {
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
    response.redirect(`/topic/${title}`);
  });
});

//update
router.get("/update/:pageId", (request, response) => {
  let filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    var title = filteredId;
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `
          <form action="/topic/update_process" method="post">
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
      `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
    );
    response.send(html);
  });
});

router.post("/update_process", (request, response) => {
  let post = request.body; // use body parser
  let id = post.id;
  let title = post.title;
  let description = post.description;

  fs.rename(`data/${id}`, `data/${title}`, (error) => {
    fs.writeFile(`data/${title}`, description, "utf8", (err) => {
      response.redirect(`/topic/${title}`);
    });
  });
});

//delete
router.post("/delete_process", (request, response) => {
  let post = request.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (error) => {
    response.redirect("/");
  });
});

// 상세보기 구현
router.get("/:pageId", function (request, response, next) {
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
        ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
      );
      response.send(html);
    }
  });
});

module.exports = router;

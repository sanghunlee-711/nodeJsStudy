var http = require("http");
var fs = require("fs"); // fs module임
const url = require("url");
var qs = require("querystring");

const templateHTML = (title, list, body) => {
  return `
  <!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${list}
          <a href = "/create">create</a>
          ${body}
        </body>
        </html>
  `;
};

const templateList = (filelist) => {
  let list = "<ul>";
  let i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href = "/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</ul>";
  return list;
};

var app = http.createServer(function (request, response) {
  var _url = request.url;
  let queryData = url.parse(_url, true).query;
  let title = queryData.id;
  let pathname = url.parse(_url, true).pathname;
  const testFolder = `./data`;

  //함수로 나눌수 있음 .. list 만드는거나 등등 ..

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir(testFolder, function (error, filelist) {
        let title = "Welcome";
        let description = "Hello, Node.js";
        let list = templateList(filelist);
        let template = templateHTML(
          title,
          list,
          `<h2>${title}</h2>${description}`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", function (error, filelist) {
        fs.readFile(
          `data/${queryData.id}`,
          "utf8",
          function (err, description) {
            let title = queryData.id;
            let list = templateList(filelist);
            let template = templateHTML(
              title,
              list,
              `<h2>${title}</h2>${description}`
            );
            response.writeHead(200);
            response.end(template);
          }
        );
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (error, filelist) {
      let title = "WEB-CREATE";
      let list = templateList(filelist);
      let template = templateHTML(
        title,
        list,
        `
        <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === "/create_process") {
    let body = "";

    // post 방식으로 전송되는 데이터가 많을 시 조각으로 데이터를 가져오고 이 때 콜백함수 콜함
    request.on("data", function (data) {
      body = body + data;

      //If too mush post data , kill the connection
      // if (body.length > 1e6);
      // request.connection.destroy();
    });

    // 더이상 조각조각 들어올 데이터가 없으면 End로 넘어감
    request.on("end", function () {
      var post = qs.parse(body); // it shows data that saved in body
      let title = post.title;
      let description = post.description;
      //경로, 내용 , utf-8, 콜백함수 를 통해 writeFile 메서드 사용을 통한 디렉토리 내에 파일 생성
      fs.writeFile(`data/${title}`, description, "utf8", function (err) {
        //redirection
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});

app.listen(3000, () => {
  console.log("3000번 포트");
});

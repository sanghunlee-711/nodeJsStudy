var http = require("http");
var fs = require("fs"); // fs module임
const url = require("url");

var app = http.createServer(function (request, response) {
  var _url = request.url;
  let queryData = url.parse(_url, true).query;
  let title = queryData.id;
  let pathname = url.parse(_url, true).pathname;
  const testFolder = `./data`;

  //함수로 나눌수 있음 .. list 만드는거나 등등 ..

  if (pathname === "/") {
    fs.readdir(testFolder, function (error, filelist) {
      console.log("filelist", filelist);

      let list = "<ul>";
      let i = 0;
      while (i < filelist.length) {
        list =
          list + `<li><a href = "/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
      }
      list = list + "</ul>";

      fs.readFile(`data/${queryData.id}`, "utf8", function (err, description) {
        let template = `<!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB2</a></h1>
          ${list}
          <h2>${title === undefined ? "Welcome" : title}</h2>
          <p>${description === undefined ? "HEllo Node.js" : description}</p>
        </body>
        </html>
        `;
        response.writeHead(200);
        response.end(template);
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }

  console.log(__dirname + _url); // file directory name + QueryString
  // response.end(fs.readFileSync(__dirname + _url)); // 사용자가 선택한 Url 따라 파일 읽는거임
  // response.end(queryData.id); // 이렇게하면 id값 뒤에 들어오는 값이 화면에 나타나게 된다.
});

app.listen(3000, () => {
  console.log("3000번 포트");
});

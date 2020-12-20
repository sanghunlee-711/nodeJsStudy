const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;
//cluster는 기본적으로 싱글프로세스로 동작하는 노드가 cpu코어를 모두 사용할 수 있게 만들어주는 모듈이다.
// 포트공유하는 노드프로세스를 여러개 둘 수도 있으므로 요청이 많을 시 병렬로 실행이된 서버의 개수만큼 분산요청을 할 수도 있다.
// 세션을 메모리에 저장하는 경우 문제가 될 수 있다.(메모리를 공유하지 못하기 때문이다.)

if (cluster.isMaster) {
  console.log(`마스터프로세스아이디: ${process.pid}`);

  //cpu개수만큼 워커를 생산한다.
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  //워커 종료시

  cluster.on("exit", (worker, code, signal) => {
    console.log(`${worker.process.pid}번 워커가 종료`);
    console.log("code", code, "signal", signal);
    cluster.fork();
  });
} else {
  //워커들이 포트에서 대기
  http
    .createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset= utf-8" });
      res.write("<h1>Hello Node!!</h1>");
      res.end("<p>Hello Cluster</p>");
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    })
    .listen(8086);

  console.log(`${process.id}번 워커 실행`);
}

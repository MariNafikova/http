const http = require("http");
const fs = require("fs");

const host = "localhost";
const port = 8000;

const requestListener = (req, res) => {
  if (req.url === "/get" && req.method === "GET") {
    function readFiles() {
      return fs.readdirSync("./files", "utf-8");
    }
    try {
      const result = readFiles();
      res.statusCode = 200;
      res.write("success: " + result);
    } catch (err) {
      res.statusCode = 500;
      res.write("Internal server error");
    }
  } else if (req.url === "/post" && req.method === "POST") {
    res.statusCode = 200;
    res.write("success");
  } else if (req.url === "/delete" && req.method === "DELETE") {
    res.statusCode = 200;
    res.write("success");
  } else if (req.url === "/redirect" && req.method === "GET") {
    res.statusCode = 200;
    res.write("Данный ресурс теперь постоянно доступен по адресу /redirected");
  } else {
    res.statusCode = 405;
    res.write("HTTP method not allowed");
  }
  res.end();
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

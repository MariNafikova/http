const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const user = require("./db.js");
const { cookieParser } = require("./cookieParser");

const host = "localhost";
const port = 8000;

const requestListener = (req, res) => {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  let cookies = cookieParser(req.headers.cookie);

  req.on("end", () => {
    let dataObj = qs.parse(data);
    if (req.url === "/auth" && req.method === "POST") {
      console.log(dataObj);
      if (
        dataObj.username === user.username &&
        dataObj.password === user.password
      ) {
        res.writeHead(200, {
          "Set-Cookie": [
            "userId=" +
              user.id +
              "; expires=" +
              new Date(new Date().setDate(new Date().getDate() + 2)),
            "authorized=" +
              true +
              "; expires=" +
              new Date(new Date().setDate(new Date().getDate() + 2)),
          ],
        });
        res.write(
          JSON.stringify({
            success: true,
            id: user.id,
            username: user.username,
          })
        );
      } else {
        res.statusCode = 401;
        res.write(
          JSON.stringify({
            success: false,
            result: "Неверный логин или пароль",
          })
        );
      }
    } else if (req.url === "/get" && req.method === "GET") {
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
      if (cookies.userId === `${user.id}` && cookies.authorized === "true") {
        if (!fs.existsSync(`./files/${dataObj.filename}`)) {
          try {
            fs.writeFileSync(
              `./files/${dataObj.filename}`,
              `${dataObj.content}`
            );
            res.statusCode = 200;
            res.write(
              JSON.stringify({
                success: true,
                result: "Файл успешно создан",
              })
            );
          } catch (err) {
            res.statusCode = 500;
            res.write(
              JSON.stringify({
                success: true,
                result: "Ошибка при создании файла",
                error: err,
              })
            );
          }
        } else {
          res.statusCode = 500;
          res.write(
            JSON.stringify({
              success: true,
              result: "Такой файл уже существует",
            })
          );
        }
      } else {
        res.statusCode = 401;
        res.write(
          JSON.stringify({
            success: false,
            result: "Вы не авторизованы",
          })
        );
      }
    } else if (req.url === "/delete" && req.method === "DELETE") {
      if (cookies.userId === `${user.id}` && cookies.authorized === "true") {
        if (fs.existsSync(`./files/${dataObj.filename}`)) {
          try {
            fs.unlinkSync(`./files/${dataObj.filename}`);
            res.statusCode = 200;
            res.write(
              JSON.stringify({
                success: true,
                result: "Файл успешно удален",
              })
            );
          } catch (err) {
            res.statusCode = 500;
            res.write(
              JSON.stringify({
                success: false,
                result: "Ошибка при удалении файла",
              })
            );
          }
        } else {
          res.statusCode = 500;
          res.write(
            JSON.stringify({
              success: false,
              result: "Файл не найден",
            })
          );
        }
      } else {
        res.statusCode = 401;
        res.write(
          JSON.stringify({
            success: false,
            result: "Вы не авторизованы",
          })
        );
      }
    } else if (req.url === "/redirect" && req.method === "GET") {
      res.statusCode = 200;
      res.write(
        "Данный ресурс теперь постоянно доступен по адресу /redirected"
      );
    } else {
      res.statusCode = 405;
      res.write("HTTP method not allowed");
    }
    res.end();
  });
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

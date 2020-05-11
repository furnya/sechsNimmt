const http = require("http");
const fs = require("fs");
const path = require("path");

const hostname = "127.0.0.1";
const port = 3000;
const port2 = 3001;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  let file = '\\\\index.html';
  if (req.url !== '/') {
    file = req.url.replace('/', '\\\\');
  }
  let filetype = path.extname(file);
  switch (filetype) {
    case '.html':
      res.setHeader("Content-Type", "text/html");
      break;
    case '.js':
      res.setHeader("Content-Type", "text/javascript");
      break;
    case '.css':
      res.setHeader("Content-Type", "text/css");
      break;
    case '.ico':
      res.setHeader("Content-Type", "image/x-icon");
      break;
  }
  let data = fs.readFileSync("dist\\sechsNimmt"+file, "utf8");
  res.write(data);
  res.end();
});

server.listen(port, hostname, () => {});

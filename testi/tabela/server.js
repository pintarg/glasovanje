var http = require("http").createServer(handler);
var fs = require("fs");

function handler(req, res) {
  fs.readFile(__dirname + "/index9.html",
    function(err, data) {
      if (err) {
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        return res.end("Napaka pri nalaganju datoteke index.html");
      }
      res.writeHead(200);
      res.end(data);
    });
}
http.listen(8080);
console.log("Zagon sistema");

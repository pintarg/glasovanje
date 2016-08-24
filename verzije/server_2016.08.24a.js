// Opis: node.js strežnik, ki skrbi za vzpostavitev spletne strani in komunikacijo s klienti
// Verzija: 2016.08.24a
// ====================================================================================================

var http = require("http").createServer(handler), // tu je pomemben argument "handler", ki je kasneje uporabljen -> "function handler (req, res); v tej vrstici kreiramo server! (http predstavlja napo aplikacijo - app)
  fs = require("fs");

function handler(req, res) { // handler za "response"; ta handler "handla" le datoteko index.html
  fs.readFile(__dirname + "/webpage.html",
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

http.listen(8080); // določimo na katerih vratih bomo poslušali | vrata 80 sicer uporablja LAMP | lahko določimo na "router-ju" (http je glavna spremenljivka, t.j. aplikacija oz. app)

console.log("Zagon sistema"); // na konzolo zapišemo sporočilo (v terminal)

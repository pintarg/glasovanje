var http = require("http").createServer(handler), // tu je pomemben argument "handler", ki je kasneje uporabljen -> "function handler (req, res); v tej vrstici kreiramo server! (http predstavlja napo aplikacijo - app)
  io = require("socket.io").listen(http),
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

// var firmata = require("firmata");
// var firmata = require('/usr/local/lib/node_modules/firmata');

console.log("Zagon sistema"); // na konzolo zapišemo sporočilo (v terminal)

// var board = new firmata.Board("/dev/ttyACM0", function() {
//   console.log("Priključitev na Arduino");
//   console.log("Firmware: " + board.firmware.name + "-" + board.firmware.version.major + "." + board.firmware.version.minor); // izpišemo verzijo Firmware
//   console.log("Omogočimo pin 13");
//   board.pinMode(13, board.MODES.OUTPUT);
// });

io.sockets.on("connection", function(socket) { // od oklepaja ( dalje imamo argument funkcije on -> ob 'connection' se prenese argument t.j. funkcija(socket)
  // ko nekdo pokliče IP preko "browser-ja" ("browser" pošlje nekaj node.js-u) se vzpostavi povezava = "connection" oz.
  // je to povezava = "connection" oz. to smatramo kot "connection"
  // v tem primeru torej želi client nekaj poslati (ko nekdo z browserjem dostopi na naš ip in port)
  // ko imamo povezavo moramo torej izvesti funkcijo: function (socket)
  // pri tem so argument podatki "socket-a" t.j. argument = socket
  // ustvari se socket_id
  socket.emit("sporociloKlientu", "Strežnik povezan."); // izvedemo funkcijo = "hello" na klientu, z argumentom, t.j. podatki="Strežnik povezan."

  socket.on("ukazArduinu", function(stevilkaUkaza) { // ko je socket ON in je posredovan preko connection-a: ukazArduinu (t.j. ukaz: išči funkcijo ukazArduinu)
    if (stevilkaUkaza == "1") { // če je številka ukaza, ki smo jo dobili iz klienta enaka 1
      // board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
      socket.emit("sporociloKlientu", "Klik na gumb prižgi, je zaznan na strežniku."); // izvedemo to funkcijo = "sporociloKlientu" na klientu, z argumentom, t.j. podatki="LED prižgana."
    } else if (stevilkaUkaza == "0") { // če je številka ukaza, ki smo jo dobili iz klienta enaka 0
      // board.digitalWrite(13, board.LOW); // na pinu 13 zapišemo vrednost LOW
      socket.emit("sporociloKlientu", "Klik na gum ugasni, je zaznan na strežniku."); // izvedemo to funkcijo = "sporociloKlientu" na klientu, z argumentom, t.j. podatki="LED ugasnjena."
    }
  });
});

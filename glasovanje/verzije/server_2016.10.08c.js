// Verzija: 2016.10.08c
// ====================================================================================================
var http = require("http").createServer(handler);
var fs = require("fs");
var io = require("socket.io").listen(http);
var redis = require("redis");
var clientRedis = redis.createClient();
var moment = require("moment");
var VprID = 1; // ID vprašanja v bazi "vprasanja"
var stVpr = 0; // število vprašanj v bazi
var zapisVprID = 0;
var statBranjeStVpr = 0; // status števca branja vprašanj - uporablja se za pravilen izpis VprID/stVpr pri dodajanju novega vprašanja

function handler(req, res) {
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
http.listen(8080);

console.log("Zagon sistema");

io.sockets.on("connection", function(socket) {
  branjeStVpr(); // branje števila vprašanj v bazi ob zagonu serverja
  // branje vprašanja iz Redis + pošiljanje ID vprašanja (zaporedna št vpr)
  socket.on("socketBeriVpr", function() {
    // branjeStVpr();
    clientRedis.hget("vprasanja", VprID, function(err, reply) {
      console.log("Vprašanje št "+VprID+": "+reply);
      socket.emit("socketVprPrebran", {"vpr":reply, "VprID":VprID, "stVpr":stVpr});
      VprID++;
    });
  });
  // zapisovanje novega vprašanja v Redis
  socket.on("socketDodajVpr", function(msg) {
    clientRedis.hset("vprasanja", stVpr+1, msg);
    socket.emit("socketVprPrebran", {"vpr":"delniIzpis", "VprID":VprID-1, "stVpr":stVpr+1});
    console.log("Prejem "+(stVpr+1)+". vpr: "+msg);
    stVpr++;
  });
  // zapisovanje izbranega odgovora v Redis
  socket.on("socketPisanjeOdg", function(msg) {
    var timestamp = new Date().getTime(); // timestamp v milisekundah
    var timestamp2 = moment().format(); // timestamp v obliki "2016-09-25T23:05:56+02:00" // uporablja se knjižnica "moment"
    console.log("Prejem ID vpr pti zapisu odg: "+msg.VprID);
    clientRedis.zadd("odgovori", msg.VprID, '{"VprID"'+':"'+msg.VprID+'","Odg"'+':"'+msg.Odg+'","ts"'+':"'+timestamp2+'","ts2":"'+timestamp+'","SocketID":"'+socket.id+'"}');
  });
  // branje izbranih odgovorov iz Redis
  socket.on("socketBranjeOdg", function() {

  });
  socket.on("socketIzpisiRezultate", function() {
    rezultati();
  });
  // FUNKCIJE =================================================================
  // branje števila vprašanj
  function branjeStVpr() {
    clientRedis.hlen("vprasanja", function(err, reply) {
      if (err) {
        console.log("Napaka pri branju števila vprašanj v bazi.");
      } else {
        stVpr = reply;
      }
    });
  }
  // izpis rezultatov
  function rezultati() {
    var j = 1;
    for (i=1; i<stVpr+1; i++) {
      clientRedis.zcount("odgovori", i, i, function(err, reply) {
        console.log("Število glasov za vprašanje "+j+": "+reply);
        j++;
      });
    }
  }
  // FUNKCIJE =================================================================
});

// Verzija: 2016.09.25a
// ====================================================================================================
var http = require("http").createServer(handler);
var fs = require("fs");
var io = require("socket.io").listen(http);
var redis = require("redis");
var clientRedis = redis.createClient();
var moment = require("moment");
var VprID = 1; // ID vprašanja v bazi "vprasanja"
var stVpr = 0; // število vprašanj v bazi
var dodajVpr = 'x';
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
  // branje vprašanja iz Redis + pošiljanje ID vprašanja (zaporedna št vpr)
  socket.on("redisBranjeVpr", function() {
    branjeStVpr();
    clientRedis.hget("vprasanja", VprID, function(err, reply) {
      console.log("Vprašanje št "+VprID+": "+reply);
      socket.emit("redisBranjeVpr2", reply.toString());
      // socket.emit("redisBranjeStVpr", VprID+"/"+stVpr.toString());
      socket.emit("redisBranjeStVpr", VprID+"/"+stVpr);
      socket.emit("vprID", VprID);
      VprID++;
    });
  });
  // zapisovanje novega vprašanja v Redis
  socket.on("redisDodajVpr", function(msg) {
    clientRedis.hset("vprasanja", stVpr+1, msg);
    console.log("Prejem novega vpr: "+msg);
    statBranjeStVpr = 1;
    branjeStVpr();
  });
  // zapisovanje izbranega odgovora v Redis
  socket.on("redisPisanjeOdg", function(msg) {
    var timestamp = new Date().getTime(); // timestamp v milisekundah
    var timestamp2 = moment().format(); // timestamp v obliki "2016-09-25T23:05:56+02:00" // uporablja se knjižnica "moment"
    console.log("Odgovor na vprašanje: "+msg+";ts:"+timestamp2+";ts2:"+timestamp+";SocketID:"+socket.id);
  });
  // branje izbranih odgovorov iz Redis
  socket.on("redisBranjeOdg", function() {

  });
  // FUNKCIJE =================================================================
  // branje števila vprašanj
  function branjeStVpr() {
    clientRedis.hlen("vprasanja", function(err, reply) {
      if (statBranjeStVpr == 1) { // potrebno za pravilen izpis VprID/stVpr pri dodajanju novega vpr
        VprID--;
      }
      if (err) {
        console.log("Napaka pri branju števila vprašanj v bazi.");
      } else {
        // console.log("Število vprašanj v bazi: "+reply);
        stVpr = reply;
        socket.emit("redisBranjeStVpr", VprID+"/"+stVpr.toString());
      }
      if (statBranjeStVpr == 1) { // potrebno za pravilen izpis VprID/stVpr pri dodajanju novega vpr
        VprID++;
        statBranjeStVpr = 0;
      }
    });
  }
  // FUNKCIJE =================================================================
});

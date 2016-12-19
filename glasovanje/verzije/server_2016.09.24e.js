// Verzija: 2016.09.24e
// ====================================================================================================
var http = require("http").createServer(handler);
var fs = require("fs");
var io = require("socket.io").listen(http);
var redis = require("redis");
var clientRedis = redis.createClient();
var VprID = 1; // ID vprašanja v bazi "vprasanja"
var stVpr = 0; // število vprašanj v bazi
var dodajVpr = 'x';


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
  branjeStVpr();
  // branje vprašanja iz Redis + pošiljanje ID vprašanja (zaporedna št vpr)
  socket.on("redisBranjeVpr", function() {
    clientRedis.hget("vprasanja", VprID, function(err, reply) {
      console.log("Vprašanje št "+VprID+": "+reply);
      socket.emit("redisBranjeVpr2", reply.toString());
      socket.emit("redisBranjeStVpr2", VprID.toString());
      VprID++;
    });
  });
  // zapisovanje novega vprašanja v Redis
  socket.on("redisDodajVpr", function(msg) {
    clientRedis.hset("vprasanja", stVpr+1, msg);
    console.log("Prejem novega vpr: "+msg);
    branjeStVpr();
  });
  // zapisovanje izbranega odgovora v Redis
  socket.on("redisPisanjeOdg", function(msg) {

  });
  // branje izbranih odgovorov iz Redis
  socket.on("redisBranjeOdg", function() {

  });
  // FUNKCIJE =================================================================
  // branje števila vprašanj
  function branjeStVpr() {
    clientRedis.hlen("vprasanja", function(err, reply) {
      if (err) {
        console.log("Napaka pri branju števila vprašanj v bazi.");
      } else {
        // console.log("Število vprašanj v bazi: "+reply);
        socket.emit("redisBranjeStVpr", reply.toString());
        stVpr = reply;
      }
    });
  }
  // FUNKCIJE =================================================================
});

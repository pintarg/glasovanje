// Verzija: 2016.10.08b
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
var dodajVpr = 'x';
var statBranjeStVpr = 0; // status števca branja vprašanj - uporablja se za pravilen izpis VprID/stVpr pri dodajanju novega vprašanja
var stOdg = 0; // uporablja se pri funkciji 'pretvorbaJSON' za pridobivanje števila odg v Sorted Set-ih
// var prejetOdg = 'x'; // uporablja se pri funkciji 'pretvorbaJSON' za pridobivanje števila odg v Sorted Set-ih


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
  // prejem VprID za ustrezen zapis v Redis
  socket.on("redisSporocanjeVprID", function(msg) {
    zapisVprID = msg;
  });
  // zapisovanje izbranega odgovora v Redis
  socket.on("redisPisanjeOdg", function(msg) {
    var timestamp = new Date().getTime(); // timestamp v milisekundah
    var timestamp2 = moment().format(); // timestamp v obliki "2016-09-25T23:05:56+02:00" // uporablja se knjižnica "moment"
    // console.log("Odg na vpr:");
    // console.log('{'+msg+',"ts"'+':"'+timestamp2+'","ts2":"'+timestamp+'","SocketID":"'+socket.id+'"}');
    clientRedis.zadd("odgovori", zapisVprID, '{'+msg+',"ts"'+':"'+timestamp2+'","ts2":"'+timestamp+'","SocketID":"'+socket.id+'"}');
  });
  // branje izbranih odgovorov iz Redis
  socket.on("redisBranjeOdg", function() {

  });
  socket.on("izpisiRezultate", function() {
    rezultati();
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

// Verzija: 2016.11.12b
// ====================================================================================================
var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io").listen(http);
var redis = require("redis");
var clientRedis = redis.createClient();
var moment = require("moment");
var VprID = 1; // ID vprašanja v bazi "vprasanja"
var stVpr = 0; // število vprašanj v bazi
var zapisVprID = 0;
var statBranjeStVpr = 0; // status števca branja vprašanj - uporablja se za pravilen izpis VprID/stVpr pri dodajanju novega vprašanja

express.get('/', function(req, res) {
  res.sendFile(__dirname + '/webpage.html');
});
express.get('/angular.js', function(req, res) {
  res.sendFile(__dirname + '/angular.js');
});
express.get('/angular-route.js', function(req, res) {
  res.sendFile(__dirname + '/angular-route.js');
});
express.get('/app.js', function(req, res) {
  res.sendFile(__dirname + '/app.js');
});
express.get('/pages/home.html', function(req, res) {
  res.sendFile(__dirname + '/pages/home.html');
});
express.get('/pages/question.html', function(req, res) {
  res.sendFile(__dirname + '/pages/question.html');
});
express.get('/pages/add-question.html', function(req, res) {
  res.sendFile(__dirname + '/pages/add-question.html');
});
express.get('/pages/answers.html', function(req, res) {
  res.sendFile(__dirname + '/pages/answers.html');
});
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
    stOdgPosameznoVpr();
    branjeRezultatov();
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
  // izpis števila prejetih odgovorov na posamezno vprašanje
  function stOdgPosameznoVpr() {
    var j=1;
    for (i=1; i<=stVpr; i++) {
      clientRedis.zcount("odgovori", i, i, function(err, reply) {
        console.log("Število glasov za vprašanje "+j+": "+reply);
        j++;
      });
    }
  }
  // branje rezultatov iz Redis in pošiljanje na webpage za izpis v tabeli
  function branjeRezultatov() {
    clientRedis.zrange("odgovori", 0, -1, function(err, reply) { // pridobivanje seznama odgovorov
      socket.emit("socketPosiljanjeRezultatov", '['+reply+']');
    });
  }
  // FUNKCIJE =================================================================
});

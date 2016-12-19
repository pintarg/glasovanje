// Verzija: 2016.10.22b
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
var prejetOdg = 'x';
var stOdg;

express.get('/', function(req, res) {
  res.sendFile(__dirname + '/webpage.html');
});
express.get('/angular.js', function(req, res) {
  res.sendFile(__dirname + '/angular.js');
});
http.listen(8080);
console.log("Zagon sistema");

io.sockets.on("connection", function(socket) {
  branjeStVpr(); // branje števila vprašanj v bazi ob zagonu serverja
  branjeStOdgVBazi(); // branje števila odgovorov v bazi ob zagonu serverja
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
    branjeStOdgVBazi();
  });
  // branje izbranih odgovorov iz Redis
  socket.on("socketBranjeOdg", function() {

  });
  socket.on("socketIzpisiRezultate", function() {
    stOdgPosameznoVpr();
    branjeRezultatov();
    // socket.emit("socketPosiljanjeRezultatov", prejetOdg);
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
    // clientRedis.zcard("odgovori", function(err, reply) {
    //   stOdg = reply;
    //   console.log("Število odg v Sorted Set-u: "+stOdg);
    // });

    for (i=0; i<stOdg; i++) {
      clientRedis.zrange("odgovori", i, i, function(err, reply) { // pridobivanje seznama odgovorov
        socket.emit("socketPosiljanjeRezultatov", JSON.parse(reply));
      });
    }

    //   clientRedis.zrange("odgovori", 0, -1, function(err, reply) { // pridobivanje seznama odgovorov
    //     // prejetOdg = reply;
    //     // console.log("Odgovori v Sorted Set-u: "+prejetOdg);
    //     socket.emit("socketPosiljanjeRezultatov", JSON.parse(reply));
    //     // socket.emit("socketPosiljanjeRezultatov", {"VprID":"1","Odg":"strinja","ts":"2016-10-22T15:09:59+02:00","ts2":"1477141799733","SocketID":"/#Zc-A_o4J-9sHLTh1AAAA"});
    //   });
  }
  function branjeStOdgVBazi() {
    clientRedis.zcard("odgovori", function(err, reply) {
      stOdg = reply;
      console.log("Število odg v Sorted Set-u: "+stOdg);
    });
  }
  // FUNKCIJE =================================================================
});

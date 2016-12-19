// Verzija: 2016.11.29b
// ====================================================================================================
var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io").listen(http);
var redis = require("redis");
var clientRedis = redis.createClient();
var moment = require("moment");
var VprID; // ID vprašanja v bazi "vprasanja"
var stVpr = 0; // število vprašanj v bazi
var zapStVpr = 1; // zaporedna številka vprašanja pri branju iz baze
// var statBranjeStVpr = 0; // status števca branja vprašanj - uporablja se za pravilen izpis VprID/stVpr pri dodajanju novega vprašanja
var startPrograma = 0; // spremenjivka, ki se uporabi za preverjanje ob vnovičnem zagonu programa
// === EXPRESS.GET initial files ===
express.get('/', function(req, res) {
  res.sendFile(__dirname + '/webpage.html');
});
express.get('/app.js', function(req, res) {
  res.sendFile(__dirname + '/app.js');
});
// === EXPRESS.GET pages ===
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
express.get('/pages/all-questions.html', function(req, res) {
  res.sendFile(__dirname + '/pages/all-questions.html');
});
// === EXPRESS.GET src ===
express.get('/src/angular.js', function(req, res) {
  res.sendFile(__dirname + '/src/angular.js');
});
express.get('/src/angular-route.js', function(req, res) {
  res.sendFile(__dirname + '/src/angular-route.js');
});
express.get('/src/ui-bootstrap-tpls.js', function(req, res) {
  res.sendFile(__dirname + '/src/ui-bootstrap-tpls.js');
});
express.get('/src/smart-table.js', function(req, res) {
  res.sendFile(__dirname + '/src/smart-table.js');
});
express.get('/src/jquery.min.js', function(req, res) {
  res.sendFile(__dirname + '/src/jquery.min.js');
});
express.get('/src/bootstrap.min.js', function(req, res) {
  res.sendFile(__dirname + '/src/bootstrap.min.js');
});
express.get('/src/bootstrap-hover-dropdown.min.js', function(req, res) {
  res.sendFile(__dirname + '/src/bootstrap-hover-dropdown.min.js');
});
// === EXPRESS.GET css ===
express.get('/css/style.css', function(req, res) {
  res.sendFile(__dirname + '/css/style.css');
});
express.get('/css/bootstrap-theme.min.css', function(req, res) {
  res.sendFile(__dirname + '/css/bootstrap-theme.min.css');
});
express.get('/css/bootstrap.min.css', function(req, res) {
  res.sendFile(__dirname + '/css/bootstrap.min.css');
});
// === EXPRESS.GET popup ===
express.get('/pages/popup/last-question.html', function(req, res) {
  res.sendFile(__dirname + '/pages/popup/last-question.html');
});
express.get('/pages/popup/duplicated-answer.html', function(req, res) {
  res.sendFile(__dirname + '/pages/popup/duplicated-answer.html');
});
express.get('/pages/popup/empty-answer.html', function(req, res) {
  res.sendFile(__dirname + '/pages/popup/empty-answer.html');
});
express.get('/pages/popup/no-question.html', function(req, res) {
  res.sendFile(__dirname + '/pages/popup/no-question.html');
});
express.get('/pages/popup/delete-warning.html', function(req, res) {
  res.sendFile(__dirname + '/pages/popup/delete-warning.html');
});
// === EXPRESS.GET pictures ===
express.get('/pictures/ozadje.jpg', function(req, res) {
  res.sendFile(__dirname + '/pictures/ozadje.jpg');
});
http.listen(8080);
console.log("Zagon sistema");

io.sockets.on("connection", function(socket) {
  branjeStVpr(); // branje števila vprašanj v bazi ob zagonu serverja
  // branje vprašanja iz Redis + pošiljanje ID vprašanja (zaporedna št vpr)
  socket.on("socketBeriVpr", function() {
    branjeStVpr();
    clientRedis.zrange("vprasanja", (zapStVpr-1), (zapStVpr-1), function(err, reply) {
      tempReply = JSON.parse(reply);
      VprID = tempReply.VprID;
      // console.log("Vprašanje št "+zapStVpr+": "+reply);
      // console.log(">>> VprID: "+tempReply.VprID+"; vprasanje: "+tempReply.vprasanje);
      socket.emit("socketVprPrebran", {"vpr":tempReply.vprasanje, "zapStVpr":zapStVpr, "stVpr":stVpr});
      zapStVpr++;
    });
  });
  // zapisovanje novega vprašanja v Redis
  socket.on("socketDodajVpr", function(msg) {
    clientRedis.zadd("vprasanja", stVpr+1, '{"VprID":"'+(stVpr+1)+'","vprasanje":"'+msg+'"}');
    socket.emit("socketVprPrebran", {"vpr":"delniIzpis", "zapStVpr":zapStVpr-1, "stVpr":stVpr+1});
    console.log("Prejem "+(stVpr+1)+". vprašanja: "+msg);
    stVpr++;
  });
  // zapisovanje izbranega odgovora v Redis
  socket.on("socketPisanjeOdg", function(msg) {
    var timestamp = new Date().getTime(); // timestamp v milisekundah
    var timestamp2 = moment().format(); // timestamp v obliki "2016-09-25T23:05:56+02:00" // uporablja se knjižnica "moment"
    clientRedis.zadd("odgovori", VprID, '{"VprID"'+':"'+VprID+'","Odg"'+':"'+msg.Odg+'","ts"'+':"'+timestamp2+'","ts2":"'+timestamp+'","SocketID":"'+socket.id+'"}');
  });
  // branje izbranih odgovorov iz Redis
  socket.on("socketBranjeOdg", function() {

  });
  socket.on("socketIzpisiRezultate", function() {
    stOdgPosameznoVpr();
    branjeRezultatov();
  });
  // brisanje posameznega odgovora iz tabele odgovorov
  socket.on("socketBrisanjeVrsticeOdg", function(msg) {
    var delElement = "$$hashKey"; // prejet JSON string vsebuje dodatni element '$$hashKey', ki je dodan s strani tabele in ga je potrebno odstraniti, da bo vsebina enaka vsebini vrstice, ki jo želimo brisati
    delete msg[delElement]; // brisanje '$$hashKey' elementa iz JSON stringa
    clientRedis.zrem("odgovori", JSON.stringify(msg), function(err, reply) {
      console.log("Število brisanih odgovorov iz tabele odgovorov: "+reply);
    });
  });
  // izpis vseh prašanj v tabelo
  socket.on("socketIzpisVprasanj", function() {
    clientRedis.zrange("vprasanja", 0, -1, function(err, reply) { // pridobivanje seznama vprašanj
      socket.emit("socketPosiljanjeVprasanj", '['+reply+']');
    });
  });
  // FUNKCIJE =================================================================
  // branje števila vprašanj
  function branjeStVpr() {
    clientRedis.zcount("vprasanja", "-inf", "+inf", function(err, reply) {
      if (err) {
        console.log("Napaka pri branju števila vprašanj v bazi: "+err);
      } else {
        stVpr = reply;
        // console.log("Število vprašanj v bazi: "+reply);
        if (startPrograma === 0) { // pošiljanje števila vprašanj v bazi ob zagonu programa
          socket.emit("socketVprPrebran", {"vpr":"zagonPrograma", "zapStVpr":zapStVpr-1, "stVpr":stVpr});
          startPrograma = 1;
        }
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

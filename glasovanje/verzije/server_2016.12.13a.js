// Verzija: 2016.12.13a
// ====================================================================================================
var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io").listen(http);
var redis = require("redis");
var clientRedis = redis.createClient();
var moment = require("moment");
var VprID, // ID vprašanja v bazi "vprasanja"
    maxVprID=0, // VprID zadnjega/najnovejšega vpr v DB
    vprasanja, // shranjevanje vprašanj iz DB
    rezultati, // shranjevanje rezultatov iz DB
    v00=0, // varovalka, ki se uporablja v funkciji 'branjeVprasanj'
    v01=0, // varovalka, ki se uporablja v funkciji 'branjeRezultatov'
    v02=0, // varovalka, ki se uporablja v funkciji 'stOdgPosameznoVpr'
    stOdgVpr = [], // število odgovorov na posamezno vprašanje - array
    stVpr = 0, // število vprašanj v bazi
    zapStVpr = 0; // zaporedna številka vprašanja pri branju iz baze
var osveziPodatke = true; // spremenjivka, ki se uporabi za preverjanje ob vnovičnem zagonu programa
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
express.get('/pages/statistics.html', function(req, res) {
  res.sendFile(__dirname + '/pages/statistics.html');
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
  socket.on("socketBeriVpr", function(msg) {
    if (msg===1) {
      zapStVpr++;
    } else if (msg===2) {
      zapStVpr--;
    }
    branjeStVpr();
    clientRedis.zrange("vprasanja", zapStVpr-1, zapStVpr-1, function(err, reply) {
      tempReply = JSON.parse(reply);
      VprID = tempReply.VprID;
      if (msg===3) {
        socket.emit("socketVprPrebran", {"vpr":'Za prikaz vprašanja klikni na gumb "Naslednje vprašanje".', "zapStVpr":zapStVpr, "stVpr":stVpr});
      } else {
        socket.emit("socketVprPrebran", {"vpr":tempReply.vprasanje, "zapStVpr":zapStVpr, "stVpr":stVpr});
      }
      // socket.emit("socketVprPrebran", {"vpr":tempReply.vprasanje, "zapStVpr":zapStVpr, "stVpr":stVpr});
    });
  });
  // zapisovanje novega vprašanja v Redis
  socket.on("socketDodajVpr", function(msg) {
    ++maxVprID;
    clientRedis.zadd("vprasanja", maxVprID, '{"VprID":"'+maxVprID+'","vprasanje":"'+msg+'"}');
    socket.emit("socketVprPrebran", {"vpr":"delniIzpis", "zapStVpr":zapStVpr, "stVpr":stVpr+1});
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
    // stOdgPosameznoVpr();
    v01=1;
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
    v00=1;
    branjeVprasanj();
  });
  // brisanje posameznega vprašanja in povezanih odgovorov iz tabele in DB
  socket.on("socketBrisanjeVrsticeVpr", function(msg) {
    var delElement = "$$hashKey";
    delete msg[delElement];
    var delVprID = msg.VprID;
    clientRedis.zrem("vprasanja", JSON.stringify(msg), function(err, reply) {
      console.log("Število brisanih vprašanj iz tabele vprašanj: "+reply);
    });
    clientRedis.zrangebyscore("odgovori", '('+(delVprID-1), delVprID, function(err, reply) {
      // console.log("Odgovori vezani na brisano vprašanje: "+reply);
      var delSeznamOdg = reply;
      clientRedis.zrem("odgovori", delSeznamOdg, function(err, reply) {
        console.log("Število brisanih odgovorov, vezanih na brisano vprašanje: "+reply);
      });
    });
    osveziPodatke = true;
    v02=1;
    branjeStVpr();
  });
  // branje vprašanj in povezanih odgovorov ter pošiljanje VprID, vprašanja, št odg 'se strinja', št odg 'vzdržan' in št odg 'se ne strinja' na webpage
  socket.on("socketIzpisStatistike", function() {
    v02=1;
    branjeStVpr();
  });
  socket.on("socketF5", function() {
    osveziPodatke = true;
    branjeStVpr();
  });
  // FUNKCIJE =================================================================
  // branje števila vprašanj
  function branjeStVpr() {
    clientRedis.zcount("vprasanja", "-inf", "+inf", function(err, reply) {
      stVpr = reply;
      // console.log("Število vprašanj v bazi: "+reply);
      if (osveziPodatke === true) { // pošiljanje števila vprašanj v bazi ob zagonu programa in ob brisanju vprašanja iz DB
        socket.emit("socketVprPrebran", {"vpr":"osveziPodatke", "zapStVpr":(zapStVpr), "stVpr":stVpr});
        osveziPodatke = false;
      }
      lastVprID(); // ko preberemo število vprašanj v DB, kličemo funkcijo 'lastVprID()', ki prebere VprID zadnjega vprašanja - 'maxVprID'
    });
  }
  // branje VprID zadnjega vprašanja v DB
  function lastVprID() {
    if (stVpr > 0) {
      clientRedis.zrange("vprasanja", (stVpr-1), (stVpr-1), function(err, reply) {
        tempReply = JSON.parse(reply);
        maxVprID = tempReply.VprID;
        stOdgPosameznoVpr(); // ko preberemo VprID zadnjega vprašanja v DB, kličemo funkcijo 'stOdgPosameznoVpr', ki sestavi array, ki vsebuje število odgovorov za posamezno vprašanje
      });
    }
  }
  // izpis števila prejetih odgovorov na posamezno vprašanje - beležimo samo vprašanja, ki imajo odgovore
  function stOdgPosameznoVpr() {
    var j=1,
        k=0;
    stOdgVpr = [];
    for (i=1; i<=maxVprID; i++) {
      clientRedis.zcount("odgovori", i, i, function(err, reply) {
        if (reply != "") {
          stOdgVpr[k] = reply;
          // console.log("stOdgVpr"+k+": "+reply);
          k++;
          // console.log("stOdgPosameznoVpr(), Array: "+stOdgVpr+" Array lenght: "+stOdgVpr.length);
        }
        // console.log("Število glasov za vprašanje "+j+": "+reply);
        // j++;
        // console.log("stOdgPosameznoVpr, i: "+i+"; maxVprID: "+maxVprID);
        if (v02===1) {
          branjeVprOdgSkupaj();
          v02=0;
          // console.log("stOdgPosameznoVpr() > klic branjeVprOdgSkupaj(), Array: "+stOdgVpr+" Array lenght: "+stOdgVpr.length);
        }
        // console.log("stOdgPosameznoVpr(), Array: "+stOdgVpr+" Array lenght: "+stOdgVpr.length);
      });
      // console.log("=====stOdgPosameznoVpr, i: "+i+"; maxVprID: "+maxVprID);
    }
  }
  // branje vprašanj in odgovorov ter sestavljanje v enoten string za izpis na webpage (podstran 'statistika')
  function branjeVprOdgSkupaj() {
    console.log("Array števila odgovorov na posamezno vprašanje: "+stOdgVpr+". Array length: "+stOdgVpr.length);
    var j=1, k=0, tempVprID, tempVpr, tempVprasanje, tempOdgovor, tempSeStrinjam,
        tempVzdrzan, tempSeNeStrinjam,
        odgovor=[]; // array vseh odgovorv, ki se posredujejo na webpage za izpis
    for(i=0; i<maxVprID; i++) {
      // console.log("i: "+i+"; maxVprID: "+maxVprID);
      clientRedis.zrangebyscore("vprasanja", '('+i, (i+1), function(err, reply) {
        // console.log("izpis stat "+j+": "+reply);
        // j++;
        if (reply != "") { // pusti '!=', če spremeniš v '!==' ne deluje
          // console.log("Stat vpr: "+reply);
          tempVprasanje = JSON.parse(reply);
          tempVprID = tempVprasanje.VprID;
          tempVpr = tempVprasanje.vprasanje;
        }
      });
      clientRedis.zrangebyscore("odgovori", '('+i, (i+1), function(err, reply) {
        if (reply != "") { // pusti '!=', če spremeniš v '!==' ne deluje
          tempSeStrinjam=0;
          tempVzdrzan=0;
          tempSeNeStrinjam=0;
          tempOdgovor = JSON.parse('['+reply+']'); // ker je odgovorov za dano vprašanje več kot eden, ga sestavimo v JSON array
          for(ii=0; ii<stOdgVpr[k]; ii++) { // ponovimo branje JSON array-a odgovorov, kolikor je odgovorov v array-u - 'stOdgVpr[k]'
            // console.log("tempOdgovorK: "+JSON.stringify(tempOdgovorK));
            if (tempOdgovor[ii].Odg == "Se strinjam") {
              tempSeStrinjam++;
            } else if (tempOdgovor[ii].Odg == "Vzdržan") {
              tempVzdrzan++;
            } else if (tempOdgovor[ii].Odg == "Se ne strinjam") {
              tempSeNeStrinjam++;
            }
          }
          // console.log("Stat odg: "+reply);
          tempOdgSeStrinjam=tempSeStrinjam+" ("+parseFloat(Math.round(tempSeStrinjam * 100) / (tempSeStrinjam+tempVzdrzan+tempSeNeStrinjam)).toFixed(1)+"%)";
          tempOdgVzdrzan=tempVzdrzan+" ("+parseFloat(Math.round(tempVzdrzan * 100) / (tempSeStrinjam+tempVzdrzan+tempSeNeStrinjam)).toFixed(1)+"%)";
          tempOdgSeNeStrinjam=tempSeNeStrinjam+" ("+parseFloat(Math.round(tempSeNeStrinjam * 100) / (tempSeStrinjam+tempVzdrzan+tempSeNeStrinjam)).toFixed(1)+"%)";
          odgovor[k]={"VprID":tempVprID,"vprasanje":tempVpr,"seStrinjam":tempOdgSeStrinjam,"vzdrzan":tempOdgVzdrzan,"seNeStrinjam":tempOdgSeNeStrinjam};
          if ((k+1) == stOdgVpr.length) {
            // console.log("Končni Odgovori:\n"+JSON.stringify(odgovor));
            socket.emit("socketPosiljanjeStatistike", odgovor);
          }
          k++;
        }
      });
    }
  }
  // branje rezultatov iz Redis in pošiljanje na webpage za izpis v tabeli
  function branjeRezultatov() {
    clientRedis.zrange("odgovori", 0, -1, function(err, reply) { // pridobivanje seznama odgovorov
      rezultati = JSON.parse('['+reply+']');
      if (v01===1) {
        socket.emit("socketPosiljanjeRezultatov", rezultati);
        v01=0;
        // console.log("Rezultati: "+JSON.stringify(rezultati));
      }
    });
  }
  // branje vprašanj iz DB
  function branjeVprasanj() {
    clientRedis.zrange("vprasanja", 0, -1, function(err, reply) { // pridobivanje seznama vprašanj
      vprasanja = JSON.parse('['+reply+']');
      if (v00===1) { // izvedba 'socketIzpisVprasanj' in pošiljanje seznama vprašanj na webpage
        socket.emit("socketPosiljanjeVprasanj", vprasanja);
        v00=0;
        // console.log("Vprašanja: "+JSON.stringify(vprasanja));
      }
    });
  }
  // FUNKCIJE =================================================================
});

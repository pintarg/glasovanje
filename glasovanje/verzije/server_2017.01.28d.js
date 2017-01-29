// Verzija: 2017.01.28d
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
    zapStVpr = 0, // zaporedna številka vprašanja pri branju iz baze
    SocketID, // SocketID povezave posameznega brskalnika
    cIP, // IP-naslov clienta
    cSocketID, // client Socket ID
    cNum=0, // število povezanih klientov
    timestamp2;
var osveziPodatke = true; // spremenjivka, ki se uporabi za preverjanje ob vnovičnem zagonu programa
var socketF5 = true; // spremenljivka, ki se uporablja pri zagonu programa in osveževanju (F5) webpage-a
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
express.get('/pages/show-question.html', function(req, res) {
  res.sendFile(__dirname + '/pages/show-question.html');
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
express.get('/pages/submit-vote.html', function(req, res) {
  res.sendFile(__dirname + '/pages/submit-vote.html');
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
express.get('/pages/popup/empty-question.html', function(req, res) {
  res.sendFile(__dirname + '/pages/popup/empty-question.html');
});
express.get('/pages/popup/duplicated-socketid.html', function(req, res) {
  res.sendFile(__dirname + '/pages/popup/duplicated-socketid.html');
});
// === EXPRESS.GET pictures ===
express.get('/pictures/ozadje.jpg', function(req, res) {
  res.sendFile(__dirname + '/pictures/ozadje.jpg');
});
http.listen(8080);
console.log("Zagon sistema");
clientRedis.del("preverjanje"); // brisanje Redis tabele 'preverjanje' ob zagonu server.js
clientRedis.del("socketid");

io.sockets.on("connection", function(socket) {
  // pridobivanje IP-naslova klienta in socket ID
  cIP=socket.request.connection.remoteAddress.substring(7); // substring odreže prvih 7 znakov (":ffff::")
  cSocketID = socket.id;
  clientRedis.hget("socketid", cIP, function(err, reply) { // preverjanje podvojenosti dostopa z istega IP
    if (reply === null) {
      console.log("Nov uporabnik. IP: "+cIP+", SocketID: "+cSocketID);
      clientRedis.hset("socketid", cIP, cSocketID);
      cNum++;
    } else {
      console.log("Podvojen dostop naprave z IP: "+cIP+". Nov SocketID podvojene naprave: "+cSocketID+". Povezava novega SocketID prekinjena!");
      socket.emit("socketDuplicatedSocketID");
      io.sockets.connected[cSocketID].disconnect();
    }
  });
  socket.emit("socketWebGENum", cNum);
  console.log("New user has connected. Socket ID: "+socket.id+". IP: "+socket.request.connection.remoteAddress.substring(7)+". Total users: "+cNum+".");
  socket.on("disconnect", function() {
    cNum--;
    socket.emit("socketWebGENum", cNum);
    console.log("User has disconnected. Socket ID: "+socket.id+". IP: "+socket.request.connection.remoteAddress.substring(7)+". Total users: "+cNum+".");
  });
  // klic ob zagonu programa in ob refresh-u (F5) webpage-a
  socket.on("socketF5", function(msg) {
    if (socketF5===true) { // ob zagonu programa
      branjeStVpr();
      socketF5=false;
    } else if (msg.includes('add-question')) { // ob refresh-u strani za dodajanje vprašanj
      beriVprasanje();
      socket.emit("socketF5webpage");
    } else if (msg.includes('all-questions') || msg.includes('answers') || msg.includes('statistics')) { // ob refresh-u (F5) strani s tabelami podatkov
      socket.emit("socketF5webpage");
    } else { // ob refresh-u (F5) strani z vprašanjem in ostalih, stranek, ki jih zgornji if-i ne pokrijejo
      beriVprasanje();
    }
  });
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
      io.emit("socketVprPrebran", {"vpr":tempReply.vprasanje, "zapStVpr":zapStVpr, "stVpr":stVpr}); //io.emit pošlje novo vprašanje vsem povezanim klientom
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
    timeStamp();
    if (msg.SocketID == "webpage") {
      SocketID = socket.id;
    } else {
      SocketID = msg.SocketID;
    }
    clientRedis.hget("preverjanje", VprID+"-"+SocketID, function(err, reply) { // preverjanje podvojenosti odgovora. Če je odgovor na prikazano vprašanje z sporočenim SocketID že zapisan, se že podan odgovor izbriše iz DB in zapiše novega-upoštevamo samo zadnji odgovor.
      if (reply !== null) {
        clientRedis.zrem("odgovori", reply);
      }
    });
    var timestamp = new Date().getTime(); // timestamp v milisekundah
    // timestamp2 = moment().format(); // timestamp v obliki "2016-09-25T23:05:56+02:00" // uporablja se knjižnica "moment"
    clientRedis.zadd("odgovori", VprID, '{"VprID"'+':"'+VprID+'","Odg"'+':"'+msg.Odg+'","ts"'+':"'+timestamp2+'","ts2":"'+timestamp+'","SocketID":"'+SocketID+'"}');
    clientRedis.hset("preverjanje", VprID+"-"+SocketID, '{"VprID"'+':"'+VprID+'","Odg"'+':"'+msg.Odg+'","ts"'+':"'+timestamp2+'","ts2":"'+timestamp+'","SocketID":"'+SocketID+'"}'); // Redis DB hash za zapisovanje spremenljivk za preverjanje podvojenosti odgovora glede na vprašanje in SocketID.
    if (msg.SocketID.includes('-GE00')) { // pošiljanje povratne informacije o zapisu odgovora glasovalne enote, da se na GE prižge ustrezno LED
      socket.emit("socketOdgGE00Zapisan");
    } else if (msg.SocketID.includes('-GE01')) {
      socket.emit("socketOdgGE01Zapisan");
    } else if (msg.SocketID.includes('-GE02')) {
      socket.emit("socketOdgGE02Zapisan");
    } else if (msg.SocketID.includes('-GE03')) {
      socket.emit("socketOdgGE03Zapisan");
    }
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
  socket.on("socketOsveziVprasanje", function() {
    beriVprasanje();
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
          k++;
        }
        if (v02===1) {
          branjeVprOdgSkupaj();
          v02=0;
        }
      });
    }
  }
  // branje vprašanj in odgovorov ter sestavljanje v enoten string za izpis na webpage (podstran 'statistika')
  function branjeVprOdgSkupaj() {
    // console.log("Array števila odgovorov na posamezno vprašanje: "+stOdgVpr+". Array length: "+stOdgVpr.length);
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
          tempSeStrinjam=0, tempVzdrzan=0, tempSeNeStrinjam=0;
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
          tempOdgSkupaj=tempSeStrinjam+tempVzdrzan+tempSeNeStrinjam;
          tempOdgSeStrinjam=tempSeStrinjam+" ("+parseFloat(Math.round(tempSeStrinjam * 100) / (tempSeStrinjam+tempVzdrzan+tempSeNeStrinjam)).toFixed(2)+"%)";
          tempOdgVzdrzan=tempVzdrzan+" ("+parseFloat(Math.round(tempVzdrzan * 100) / (tempSeStrinjam+tempVzdrzan+tempSeNeStrinjam)).toFixed(2)+"%)";
          tempOdgSeNeStrinjam=tempSeNeStrinjam+" ("+parseFloat(Math.round(tempSeNeStrinjam * 100) / (tempSeStrinjam+tempVzdrzan+tempSeNeStrinjam)).toFixed(2)+"%)";
          odgovor[k]={"VprID":tempVprID,"vprasanje":tempVpr,"seStrinjam":tempOdgSeStrinjam,"vzdrzan":tempOdgVzdrzan,"seNeStrinjam":tempOdgSeNeStrinjam,"skupaj":tempOdgSkupaj};
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
      }
    });
  }
  function beriVprasanje() {
    branjeStVpr();
    if (zapStVpr===0) {
      socket.emit("socketVprPrebran", {"vpr":'Za prikaz vprašanja klikni na gumb "Naslednje vprašanje".', "zapStVpr":zapStVpr, "stVpr":stVpr});
    } else {
      clientRedis.zrange("vprasanja", zapStVpr-1, zapStVpr-1, function(err, reply) {
        tempReply = JSON.parse(reply);
        VprID = tempReply.VprID;
        socket.emit("socketVprPrebran", {"vpr":tempReply.vprasanje, "zapStVpr":zapStVpr, "stVpr":stVpr});
      });
    }
  }
  function timeStamp() { // funkcija timestamp-a, ki se uporabi pri zapisu prejetih odg v tabelo. Timestamp v human readable format-u.
    var today=new Date(),
        h=today.getHours(),
        m=today.getMinutes(),
        s=today.getSeconds(),
        dd=today.getDate(),
        mm=today.getMonth()+1,
        yyyy=today.getFullYear();
    if (String(h).length<2) h="0"+h;
    if (String(m).length<2) m="0"+m;
    if (String(s).length<2) s="0"+s;
    if (String(dd).length<2) dd="0"+dd;
    if (String(mm).length<2) mm="0"+mm;
    timestamp2 = dd+"."+mm+"."+yyyy+", "+h+":"+m+":"+s;
  }
  // FUNKCIJE =================================================================
});

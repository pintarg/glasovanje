// Verzija: 2016.12.27a
// ====================================================================================================
var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io").listen(http);
// var clientRedis = redis.createClient();
express.get('/', function(req, res) {
  res.sendFile(__dirname + '/webpage.html');
});

http.listen(8080);
console.log("Zagon sistema");

io.sockets.on("connection", function(socket) {
  // klic ob zagonu programa in ob refresh-u (F5) webpage-a

});

// Verzija:
// ====================================================================================================
var express = require("express")();
var http = require("http").Server(express);
var io = require("socket.io").listen(http);

express.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
express.get('/angular.js', function(req, res) {
  res.sendFile(__dirname + '/angular.js');
});
http.listen(8080);
console.log("Zagon sistema");

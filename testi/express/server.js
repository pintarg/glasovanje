var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/angular.js', function(req, res){
  res.sendFile(__dirname + '/angular.js');
});

server.listen(8080, function(){
  console.log('listening on *:8080');
});

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/login.html', function(req, res){
  res.sendFile(__dirname + '/login.html');
});
app.get('/dashboard.html', function(req, res){
  res.sendFile(__dirname + '/dashboard.html');
});
app.get('/test-page.html', function(req, res){
  res.sendFile(__dirname + '/test-page.html');
});

app.get('/angular.js', function(req, res){
  res.sendFile(__dirname + '/angular.js');
});
app.get('/angular-route.js', function(req, res){
  res.sendFile(__dirname + '/angular-route.js');
});
app.get('/controller.js', function(req, res){
  res.sendFile(__dirname + '/controller.js');
});

server.listen(8080, function(){
  console.log('listening on *:8080');
});

// Verzija: 2017.02.03c
// ====================================
// var bodyParser = require('body-parser');
// var express = require('express');
// var app = express();
// app.set('view engine', 'html');
//
// app.use(bodyParser.urlencoded({extended:true}));
//
// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/views/index.html');
// });
// app.get('/login', function(req, res) {
//   res.sendFile(__dirname + '/views/login.html');
// });
// app.post('/login', function(req, res) {
//   res.json(req.body);
// });
// app.get('/dashboard', function(req, res) {
//   res.sendFile(__dirname + '/views/dashboard.html');
// });
// app.get('/logout', function(req, res) {
//   res.sendFile(__dirname + '/views/index.html');
// });
// app.listen(8080);


// -------------------
var bodyParser = require('body-parser');
var express = require('express')();
var http = require('http').Server(express);
var redis = require('redis');
var clientRedis = redis.createClient();
express.set('view engine', 'html');

express.use(bodyParser.urlencoded({extended:true}));

express.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
express.get('/login', function(req, res) {
  res.sendFile(__dirname + '/views/login.html');
});
express.post('/login', function(req, res) {
  // res.json(req.body);
  clientRedis.hget("user", req.body.username, function(err, user) {
    tmpReply = JSON.parse(user);
    // console.log("Username: "+req.body.username);
    if (user === null) {
      res.sendFile(__dirname + '/views/err-wrong-user-pass.html');
    } else {
      if (req.body.password === tmpReply.password) {
        res.sendFile(__dirname + '/views/dashboard.html');
      } else {
        res.sendFile(__dirname + '/views/err-wrong-user-pass.html');
      }
    }
  });
});
express.get('/dashboard', function(req, res) {
  res.sendFile(__dirname + '/views/dashboard.html');
});
express.get('/logout', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
http.listen(8080);

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res) {
  res.render(__dirname + '/views/index.ejs');
});
app.get('/login', function(req, res) {
  res.render(__dirname + '/views/login.ejs');
});
app.post('/login', function(req, res) {
  res.json(req.body);
});
app.get('/dashboard', function(req, res) {
  res.render(__dirname + '/views/dashboard.ejs');
});
app.get('/logout', function(req, res) {
  res.redirect('/');
});
app.listen(8080);


// -------------------
// var bodyParser = require('body-parser');
// var express = require('express')();
// var http = require("http").Server(express);
//
// express.use(bodyParser.urlencoded({extended:true}));
//
// express.get('/', function(req, res) {
//   res.sendFile(__dirname + '/views/index.html');
// });
// express.get('/login', function(req, res) {
//   res.sendFile(__dirname + '/views/login.html');
// });
// express.post('/login', function(req, res) {
//   res.json(req.body);
// });
// express.get('/dashboard', function(req, res) {
//   res.sendFile(__dirname + '/views/dashboard.html');
// });
// express.get('/logout', function(req, res) {
//   res.sendFile(__dirname + '/views/index.html');
// });
// http.listen(8080);

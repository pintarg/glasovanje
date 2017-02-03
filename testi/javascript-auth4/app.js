var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.set('view engine', 'jade');
app.locals.pretty = true;

// middleware
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res) {
  res.render(__dirname + '/views/index.jade');
});
app.get('/register', function(req, res) {
  res.render(__dirname + '/views/register.jade');
});
app.get('/login', function(req, res) {
  res.render(__dirname + '/views/login.jade');
});
app.post('/login', function(req, res) {
  res.json(req.body);
});
app.get('/dashboard', function(req, res) {
  res.render(__dirname + '/views/dashboard.jade');
});
app.get('/logout', function(req, res) {
  res.redirect('/');
});
app.listen(8080);

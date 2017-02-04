// Verzija: 2017.02.03f
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
var sessions = require('client-sessions');
var bcrypt = require('bcryptjs');
express.set('view engine', 'html');

// middleware
express.use(bodyParser.urlencoded({extended:true}));

express.use(sessions({
  cookieName: 'session',
  secret: 'asd123aFsd234',
  duration: 60*60*1000, // 1h
  activeDuration: 30*60*1000,
  httpOnly: true,
}));

express.use(function(req, res, next) {
  if (req.session && req.session.user) {
    tmpUser = JSON.parse(req.session.user);
    clientRedis.hget('user', tmpUser.username, function(err, user) {
      if (user !== null) {
        req.user = user;
        delete req.user.password;
        req.session.user = req.user;
        res.locals.user = req.user;
      }
      next();
    });
  } else {
    next();
  }
});

function requireLogin(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

express.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
express.get('/login', function(req, res) {
  res.sendFile(__dirname + '/views/login.html');
});
express.post('/login', function(req, res) {
  console.log("Login post. req.body: "+req.body);
  clientRedis.hget('user', req.body.username, function(err, user) {
    tmpReply = JSON.parse(user);
    // console.log("Username: "+req.body.username);
    if (user === null) {
      res.sendFile(__dirname + '/views/err-wrong-user-pass.html');
    } else {
      // if (req.body.password === tmpReply.password) {
      if (bcrypt.compareSync(req.body.password, tmpReply.password)) {
        req.session.user = user;
        res.redirect('/dashboard');
      } else {
        res.sendFile(__dirname + '/views/err-wrong-user-pass.html');
      }
    }
  });
});
express.get('/dashboard', requireLogin, function(req, res) {
    res.sendFile(__dirname + '/views/dashboard.html');
});
express.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
  // res.sendFile(__dirname + '/views/index.html');
});
http.listen(8080);

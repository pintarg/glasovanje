var http = require("http").createServer(handler); // handler za delo z aplikacijo
var io = require("socket.io").listen(http); // socket.io za trajno povezavo med strež. in klient.
var fs = require("fs"); // spremenljivka za "file system", t.j. fs

var redis = require("redis");
var clientRedis = redis.createClient();

function handler(req, res) {
    fs.readFile(__dirname + "/testredis02.html",
        function(err, data) {
            if (err) {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                return res.end("Napaka pri nalaganju html strani");
            }
            res.writeHead(200);
            res.end(data);
        });
}

http.listen(1337); // določimo na katerih vratih bomo poslušali

console.log("Zagon sistema"); // v konzolo zapišemo sporočilo (v terminal)

io.sockets.on("connection", function(socket) {
    //    socket.emit("sporociloKlientu", "Strežnik povezan.");
    socket.on("ukazArduinu", function(stevilkaUkaza) {
        if (stevilkaUkaza == "1") {
            console.log(1);
        } else if (stevilkaUkaza == "0") {
            console.log(0);
        }
    });

    socket.on("pisiVbazo", function(podatek) {
        console.log("Pišemo podatek: " + podatek);

        clientRedis.rpush("zapis", podatek);

    });

    socket.on("beriIzBaze", function() {
        console.log("Beremo podatek iz baze: ");

        clientRedis.lrange("zapis", 0, -1, function(err, reply) { // preberemo iz baze
            console.log(reply.toString());

            socket.emit("beriBazo", reply.toString());

        });

    });





});

// var server = require("http").Server(app);
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs")
server.listen(process.env.PORT || 3000);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
})
app.get("/main", function(req, res) {
    res.sendFile(__dirname + "/js/main.js");
})
app.get("/adapter", function(req, res) {
    res.sendFile(__dirname + "/js/lib/adapter.js");
})
app.get("/turnsv", function(req, res) {
    let o = {
        iceServers: [{   urls: ["stun:ss-turn2.xirsys.com"] },
            {  
                username: "E4bphbAk4Dbopxj_8MMpnJzYcbgpnBH2x4b_ES-4pnw0ZQWb3Xt5kC8CZvE9wyXRAAAAAF7ozCtuaGF2Ym5t",
                  
                credential: "299abf54-afd7-11ea-b1f4-0242ac140004",
                  
                urls: ["turn:ss-turn2.xirsys.com:80?transport=udp",       
                    "turn:ss-turn2.xirsys.com:3478?transport=udp",       
                    "turn:ss-turn2.xirsys.com:80?transport=tcp",       
                    "turn:ss-turn2.xirsys.com:3478?transport=tcp",       
                    "turns:ss-turn2.xirsys.com:443?transport=tcp",       
                    "turns:ss-turn2.xirsys.com:5349?transport=tcp"  
                ]
            }
        ]
    };

    let bodyString = JSON.stringify(o);
    let https = require("https");
    let options = {
        host: "global.xirsys.net",
        path: "/_turn/streamx",
        method: "PUT",
        headers: {
            "Authorization": "Basic " + Buffer.from("nhavbnm:feffd4ec-afd5-11ea-b23e-0242ac150003").toString("base64"),
            "Content-Type": "application/json",
            "Content-Length": bodyString.length
        }
    };

    let httpreq = https.request(options, function(httpres) {
        let str = "";
        httpres.on("data", function(data) { str += data; });
        httpres.on("error", function(e) { console.log("error: ", e); });
        httpres.on("end", function() {
            console.log("response: ", str);
            res.send(str);
        });
    });

    httpreq.on("error", function(e) { console.log("request error: ", e); });
    httpreq.end(bodyString);
})
app.post("/turnsv", function(req, res) {
    let o = {
        iceServers: [{   urls: ["stun:ss-turn2.xirsys.com"] },
            {  
                username: "E4bphbAk4Dbopxj_8MMpnJzYcbgpnBH2x4b_ES-4pnw0ZQWb3Xt5kC8CZvE9wyXRAAAAAF7ozCtuaGF2Ym5t",
                  
                credential: "299abf54-afd7-11ea-b1f4-0242ac140004",
                  
                urls: ["turn:ss-turn2.xirsys.com:80?transport=udp",       
                    "turn:ss-turn2.xirsys.com:3478?transport=udp",       
                    "turn:ss-turn2.xirsys.com:80?transport=tcp",       
                    "turn:ss-turn2.xirsys.com:3478?transport=tcp",       
                    "turns:ss-turn2.xirsys.com:443?transport=tcp",       
                    "turns:ss-turn2.xirsys.com:5349?transport=tcp"  
                ]
            }
        ]
    };

    let bodyString = JSON.stringify(o);
    let https = require("https");
    let options = {
        host: "global.xirsys.net",
        path: "/_turn/streamx",
        method: "PUT",
        headers: {
            "Authorization": "Basic " + Buffer.from("nhavbnm:feffd4ec-afd5-11ea-b23e-0242ac150003").toString("base64"),
            "Content-Type": "application/json",
            "Content-Length": bodyString.length
        }
    };

    let httpreq = https.request(options, function(httpres) {
        let str = "";
        httpres.on("data", function(data) { str += data; });
        httpres.on("error", function(e) { console.log("error: ", e); });
        httpres.on("end", function() {
            console.log("response: ", str);
            res.send(str);
        });
    });

    httpreq.on("error", function(e) { console.log("request error: ", e); });
    httpreq.end(bodyString);
})



console.log("server running...");

//-----------------------------------

//-----------------------------------

var mangUser = [];
var mangRom = [];
var x = 0;
io.sockets.on('connection', function(socket) {

    //x = x + 1;
    console.log(x + "-" + socket.id);
    mangUser.push(socket.id);
    // convenience function to log server messages on the client
    function log() {
        var array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
        log('Client said: ', message);
        // for a real app, would be room-only (not broadcast)
        console.log("message " + socket.id + "-" + message)
    });

    socket.on("create", function(data) {
        mangRom.push({ 'room': data, 'us': [socket.id] })
        console.log(mangRom);
        for (let index = 0; index < mangRom.length; index++) {
            if (data == mangUser[index].room) {
                log('Room ' + room + ' now has ' + mangUser[index].us.length + ' client(s)')
            }

        }
        socket.emit('created', data, socket.id);

    })

    socket.on("join", function(data) {
        log('Client ID ' + socket.id + ' joined room ' + data);
        // io.sockets.in(room).emit('join', room);
        // socket.join(room);
        // socket.emit('joined', room, socket.id);
        socket.broadcast.emit("join", data)
        var i;
        for (let index = 0; index < mangRom.length; index++) {
            //const element = mangRom[index];
            if (mangRom[index].room == data) {
                mangRom[index].us.push(socket.id);
                i = index;
            }
        }
        for (let index = 0; index < mangRom[i].us.length; index++) {
            socket.to(mangRom[i].us[index]).emit('ready');
        }
        socket.emit('joined', data, socket.id);
        console.log(mangRom);
    })

    socket.on('create or join', function(room) {
        console.log("rom: " + room)
        log('Received request to create or join room ' + room);

        var numClients = mangUser.length;
        log('Room ' + room + ' now has ' + numClients + ' client(s)');
        console.log('Room ' + room + ' now has ' + numClients + ' client(s)');

        if (numClients === 1) {
            socket.join(room);
            log('Client ID ' + socket.id + ' created room ' + room);
            console.log('Client ID ' + socket.id + ' created room ' + room);
            socket.emit('created', room, socket.id);

        } else if (numClients === 2) {
            log('Client ID ' + socket.id + ' joined room ' + room);
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room, socket.id);
            io.sockets.in(room).emit('ready');
        } else { // max 5 clients
            socket.emit('full', room);
        }
    });

    socket.on('ipaddr', function() {
        log('Client said: ipaddr');
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].forEach(function(details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });

    socket.on("disconnect", function() {
        if (mangRom.length != 0) {
            for (let index = 0; index < mangUser.length; index++) {
                if (mangUser[index] == socket.id) {
                    mangUser.splice(index, 1);
                }

            }
            for (let index = 0; index < mangRom.length; index++) {
                for (let j = 0; j < mangRom[index].us.length; j++) {

                    if (mangRom[index].us[j] == socket.id) {
                        mangRom[index].us.splice(j, 1);
                    }
                }


            }
            for (let index = 0; index < mangRom.length; index++) {
                if (mangRom[index].us.length == 0) {
                    mangRom.splice(index, 1);
                }

            }
        }
        console.log(mangRom)
    })

    socket.on('bye', function() {
        console.log('received bye');
    });
});
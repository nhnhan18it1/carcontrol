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
    });
});

httpreq.on("error", function(e) { console.log("request error: ", e); });
httpreq.end(bodyString);
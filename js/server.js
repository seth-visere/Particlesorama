var http = require('http'), url = require("url"), path = require("path"), sys = require("sys"), fs = require('fs'), querystring = require("querystring"), crypto = require('crypto'), redis = require("redis");



var redisClient = redis.createClient();
redisClient.on("error", function (err) {
    console.log("Error " + err);
});

var httpServer = http.createServer(function(req, res) {
	req.content = "";
	if (url.parse(req.url).pathname == "/api") {
		console.log(req.method);
		switch (req.method) {
		case "GET":
			var key = url.parse(req.url, true).query.q;
			if (key != undefined && key != "") {
				console.log(key);
				res.writeHead(200, {
					'Content-Type' : 'text/json',
					'Access-Control-Allow-Origin' : 'http://localhost'
				});
				redisClient.get(key, function(err, val){
					res.end(val);
				});
			} else {
				res.writeHead(404, {
					'Content-Type' : 'text/plain',
					'Access-Control-Allow-Origin' : 'http://localhost'
				});
				res.end("Not found");
			}
			break;
		case "POST":
			req.addListener("data", function(chunk){
				req.content += chunk;
			});
			req.addListener("end", function(){
				var data = querystring.parse(req.content);
				if(data.json != undefined && data.json != ""){
					var sha1 = crypto.createHash('sha1');
					sha1.update(data.json);
					var hash = sha1.digest("hex");
					console.log(data.json);
					console.log(hash);
					redisClient.set(hash, data.json, function(error, reply){
						res.writeHead(200, {
							'Content-Type' : 'text/json',
							'Access-Control-Allow-Origin' : 'http://localhost'
						});
						res.end(reply);
					});
				}
			});
			break;
		}
	}
});

httpServer.listen(7411);
console.log('Server running at port 7411');

var express = require('express')
var app = express()
var http = require('http').Server(app);
var request = require('request');
var cheerio = require('cheerio');
var io = require('socket.io')(http);

// this is where we'll store the presentation
// when it starts up it registers itself
var presentation;

// this is the simple file access
app.get('/', function(req, res){
   console.log("connected");
   res.sendfile('controller.html');
});

// all the rest
app.use(express.static(__dirname));

// Emit welcome message on connection
io.on('connection', function(socket) {
    console.log(" connected ");

    // these are all the socket commands coming from Controller
    socket.on('pres', function() {
    	console.log(" presentation stored ");
    	presentation = socket;
    })
    socket.on('cmd', function(data) { 
    	console.log(data);
    	presentation.emit('cmd', data);
    });
    socket.on('chat', function(data) { 
        console.log(data);
        presentation.emit('chat', data);
    });
    socket.on('cchat', function(data) { 
        console.log(data);
        presentation.emit('cchat', data);
    });

    socket.on('getyturl', function(data)
    {
        // this is where we get the URL of a random Youtube video, some of these will be ok
        url = "http://randomyoutube.net/watch"
        // The structure of our request call
        // The first parameter is our URL
        // The callback function takes 3 parameters, an error, response status code and the html

        request(url, function(error, response, html){

            // First we'll check to make sure no errors occurred when making the request
            if(!error){
                // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
                var $ = cheerio.load(html);

                // Finally, we'll define the variables we're going to capture
                yt_url = $('.youtube-player').attr('src');
                urls = yt_url.split('/');
                console.log(urls[urls.length - 1 ]);
                code = urls[urls.length - 1].split("?")[0];
                socket.emit("yt_url", code);
            } else {
                socket.emit("yt_url", "error");
            }
        })
    });
});

// now the listen on this port for anything
http.listen(8000,  function() {
	console.log(" listening ");
});

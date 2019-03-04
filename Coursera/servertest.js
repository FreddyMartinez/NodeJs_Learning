var http = require('http');
var fs = require('fs');
var path = require('path'); 
var port = 3000;

var server = http.createServer(function(req, res){
    if(req.method == 'GET'){
        var fileurl;
        if(req.url == '/') fileurl = '/index.html';
        else fileurl = req.url;

        var filePath = path.resolve('./public'+fileurl);
console.log(filePath);
        var fileExt = path.extname(filePath);

        if(fileExt == '.html'){
            fs.exists(filePath, function(exists){
                if(!exists){
                    res.writeHead(404, {'Content-Type' : 'text/html'});
                    res.end('<h1>Error 404: ' + fileurl + ' not found</h1>');
                }
                res.writeHead(200, {'Content-Type' : 'text/html'});
                fs.createReadStream(filePath).pipe(res);
            });
        }
        else{
            res.writeHead(404, {'Content-Type' : 'text/html'});
            res.end('<h1>Error 404: ' + fileurl + ' not a html file</h1>');
        }
    }
    else{
        res.writeHead(404, {'Content-Type' : 'text/html'});
            res.end('<h1>Error 404: ' + req.method + ' not suported</h1>');
    }

});

server.listen(port);

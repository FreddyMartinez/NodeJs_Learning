var http = require("http");

// var manejador = function(input, ouput){
//     console.log(input);
//     ouput.end("Hello World");
// };

// var servidor = http.createServer(manejador);

// servidor.listen(8080);

var servidor = http.createServer(function(req, res){
    res.setHeader("Content-Type","text/html");
    res.statusCode = 200;
    res.writeHead(200, {"Content-Type":"text/html"});
    res.write("Hello World Motherfuckers");
    res.end("<head></head><body> <h1>Hola mother foca</h1></body>");
});

servidor.listen(8080);



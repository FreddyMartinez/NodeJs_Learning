var http = require("http"),
    fs = require("fs");

http.createServer(function(req, res){
    fs.readFile("./index.html",function(err,html){
        var html_string = html.toString();
        var variables = html_string.match(/[^\{\}]+(?=\})/g);
        var nombre = "Freddy";
        for (let i = 0; i < variables.length; i++) {
            var valor = eval(variables[i]); //funcion js que evalúa un string como código js
            html_string = html_string.replace("{" + variables[i] + "}", valor);
        }

        res.writeHead(200,{"Content-Type":"text/html"});
        res.write(html_string);
        res.end();
    });
}).listen(8080);
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(8080, '46.101.202.239');
console.log('Server running at 46.101.202.239:8080/');

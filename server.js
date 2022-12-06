//import http, url and fs modules
const http = require('http'),
  url = require('url'),
  fs = require('fs');

//create a server
http.createServer((request, response) => {

//grabb user-generated URL from the request object itself
let addr = request.url,
 userURL = url.parse(addr, true),
 filePath = '';

//log the request URL and a timestamp to log.txt
  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });  

//check if URL includes word "doumentation"
  if (userURL.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html');
  } else {
    filePath = 'index.html';
  }

//throw stops execution of the function - statements after throw won't be executed
  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
  }
//instruct server to listen for requests on port 8080
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write(data);
    response.end();

  });

}).listen(8080);

console.log('My first Node test server is running on Port 8080.');
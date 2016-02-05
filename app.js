const http = require('http')

const hostname = '127.0.0.1';
const port = 5000;

var MyClass = require('./modules/MyClass').default

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })

  var myClassInstance = new MyClass();
  var value = myClassInstance.getNewsById("1")

  res.end(value);
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})
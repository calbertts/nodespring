var express = require('express');
var app = express();

const port = 5000

var ModuleContainer = require('./compiled/nodespring/core/moduleContainer').ModuleContainer
ModuleContainer.init(app)
ModuleContainer.loadModules()

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(port, function () {
  console.log('Server running at http://localhost:5000');
});
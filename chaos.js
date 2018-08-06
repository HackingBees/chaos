var app = require('./app/config/config')();

app.listen(8080, function () {
  var now = new Date();
  console.log('Chaos Platform is up and listening for requests. ' + now);
})

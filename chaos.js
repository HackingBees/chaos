var app = require('./app/config/config')();

var portNumber = process.env.PORT || 8080;

if (!process.env.NODE_ENV) {
    var env="dev";
} else {
    var env=process.env.NODE_ENV;
}

var dbConnection = app.drivers.connectionFactory();
app.set('connection',dbConnection);

const server = app.listen(portNumber, function () {
  var now = new Date();
  console.log('Chaos Platform is up in ' + env + ' environment.');
  console.log('== Chaos is listening on port '+portNumber+'. ');
  console.log('== '+now);
});

setInterval(() => server.getConnections(
    (err, connections) => console.log(`${connections} connections currently open`)
), 10000);

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

var connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
    console.log('Chaos Received kill signal, shutting down gracefully');
    console.log('==Closing DB Pool.');
    dbConnection.end(function (err) {
        if (err) {
            return next(err);
        }
        console.log('==DB Pool closed.');
    });
    console.log('Closing Server');
    server.close(() => {
            console.log('Closed out remaining connections');
            process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

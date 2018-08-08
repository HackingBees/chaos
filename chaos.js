var app = require('./app/config/config')();

var portNumber = process.env.PORT || 8080;

if (!process.env.NODE_ENV) {
    var env="dev";
} else {
    var env=process.env.NODE_ENV;
}

var dbConnection = app.drivers.connectionFactory();
app.set('dbConnection',dbConnection);

const server = app.listen(portNumber, function () {
  var now = new Date();
  console.log('Chaos Platform is up in ' + env + ' environment.');
  console.log('== Chaos is listening on port '+portNumber+'. ');
  console.log('== '+now);

  createAdminUser();

});

/*
setInterval(() => server.getConnections(
    (err, connections) => console.log(`${connections} connections currently open`)
), 10000);
*/

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

function createAdminUser(){
    var SysUsersDAO = new app.models.SysUsersDAO(app.get('dbConnection'));
    SysUsersDAO.searchByUserName("admin@hackingbees.tech", function(err, results){
      if (err) {
          return next(err);
      }
      if (results.length == 0) {
          console.log("==== Admin user not found. Creating Admin user");
          var adminPassword = app.get('bcrypt').hashSync("admin", 10);
          var sysuser = { fullname: 'HackingBees Admin',
                          username: 'admin@hackingbees.tech',
                          email: 'admin@hackingbees.tech',
                          password: adminPassword,
                          active: 0};
          var SysUsersDAO = new app.models.SysUsersDAO(app.get('dbConnection'));
          SysUsersDAO.add(sysuser, function(err, results){
              if (err) {
                  return next(err);
              }
              console.log("====== Admin user created");
          });
      } else {
          console.log("==== Admin user found.");
          return true;
      }
  });
}

var app = require('./app/config/config')();
var settings = app.get('settings');

const server = app.listen(settings.env.portNumber, function () {
  var now = new Date();
  console.log('Chaos Platform is up in ' + settings.env.type + ' environment.');
  console.log('== Chaos is listening on port ' + settings.env.portNumber + '. ');
  console.log('== ' + now);

  checkAndCreateTables();
  /*checkAndCreateAdminUser();
  checkAndCreateDefaultTenant();
  checkAndCreateDefaultApp();*/     

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
    app.get('dbConnection').end(function (err) {
        if (err) {
            return next(err);
        }
        console.log('==DB Pool closed.');
    });
    console.log('==Closing Session Store');
    app.get('sessionStore').close();
    console.log('==Closing Server');
    server.close(() => {
            console.log('==Closed out remaining connections');
            process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

function readSQLFile(filename, callback) {
    var fs = app.get('fs');
    fs.readFile('db/'+filename, 'utf8', function(err, data) {
        if (err) {
            console.log("Error reading File:" + err);
        }
        return callback(data);
    });
}

function createTable(tablename) {
    console.log("Will Create "+tablename);
    readSQLFile(tablename+'.sql', function(createStatement){
        var dbConnection = app.get('dbConnection');
        dbConnection.query(createStatement, function (err, results) {
            if (err) return err;
            console.log("Table " + tablename + " Created.");
            createDefaultRecord(tablename);
        });
    });
}

function checkAndCreateTables() {
    var SysUsersDAO = new app.models.SysUsersDAO(app.get('dbConnection'));
    SysUsersDAO.exists( function(err, results){
        if (err) { 
            createTable('sys_users');
        } else console.log("Table SYS_USERS already exists");
    });
    
    var SysAppsDAO = new app.models.SysAppsDAO(app.get('dbConnection'));
    SysAppsDAO.exists( function(err, results){
        if (err) {
            createTable('sys_apps');
        } else console.log("Table SYS_APPS already exists");
    });
    
    var SysTenantsDAO = new app.models.SysTenantsDAO(app.get('dbConnection'));
    SysTenantsDAO.exists( function(err, results){
        if (err) {
            createTable('sys_tenants');
        } else console.log("Table SYS_TENANTS already exists");
    });
}

function createDefaultRecord(tablename) {
    switch(tablename) {
        case 'sys_users':
            checkAndCreateAdminUser();
        break;
        case 'sys_apps':
            checkAndCreateDefaultApp();
        break;
        case 'sys_tenants':
            checkAndCreateDefaultTenant();
        break;
    }
}
            
function checkAndCreateAdminUser(){
    var SysUsersDAO = new app.models.SysUsersDAO(app.get('dbConnection'));
    SysUsersDAO.searchByUserName("admin@hackingbees.com", function(err, results){
      if (err) {
          console.log(err);
          return err;
      }
      if (results.length == 0) {
          console.log("==== Admin user not found. Creating Admin user.");
          var adminPassword = app.get('bcrypt').hashSync(settings.adminUser.initialPassword, 10);
          var sysuser = { fullname: settings.adminUser.fullname,
                          username: settings.adminUser.username,
                          email: settings.adminUser.email,
                          password: adminPassword,
                          active: 1
                      };
          var SysUsersDAO = new app.models.SysUsersDAO(app.get('dbConnection'));
          SysUsersDAO.add(sysuser, function(err, results){
              if (err) {
                  return next(err);
              }
              console.log("==== " + settings.adminUser.fullname + " user created uccessfully.");
          });
      } else {
          console.log("==== Admin user is " + settings.adminUser.fullname + ".");
          return true;
      }
  });
}

function checkAndCreateDefaultTenant(){
    var SysTenantsDAO = new app.models.SysTenantsDAO(app.get('dbConnection'));
    SysTenantsDAO.searchByName("Platform Admin Tenant", function(err, results){
      if (err) {
          console.log(err);
          return err;
      }
      if (results.length == 0) {
          console.log("==== Default tenant not found. Creating Default tenant.");
          var systenant = { name: settings.defaultTenant.name,
                      };
          console.log(systenant);
          var SysTenantsDAO = new app.models.SysTenantsDAO(app.get('dbConnection'));
          SysTenantsDAO.add(systenant, function(err, results){
              if (err) {
                  return next(err);
              }
              console.log("==== " + settings.defaultTenant.name + " tenant created uccessfully.");
          });
      } else {
          console.log("==== Defaut Tenant is " + settings.defaultTenant.name + ".");
          return true;
      }
  });
}

function checkAndCreateDefaultApp(){
    var SysAppsDAO = new app.models.SysAppsDAO(app.get('dbConnection'));
    SysAppsDAO.searchByName("Chaos Platform", function(err, results) {
      if (err) {
          console.log(err);
          return err;
      }
      if (results.length == 0) {
          console.log("==== Default app not found. Creating Default app.");
          var sysapp = { name: settings.defaultApp.name,
                         description: settings.defaultApp.description,
                         active: settings.defaultApp.active,
                      };
          var SysAppsDAO = new app.models.SysAppsDAO(app.get('dbConnection'));
          SysAppsDAO.add(sysapp, function(err, results){
              if (err) {
                  return next(err);
              }
              console.log("==== " + settings.defaultApp.name + " app created uccessfully.");
          });
      } else {
          console.log("==== Defaut App is " + settings.defaultApp.name + ".");
          return true;
      }
  });
}


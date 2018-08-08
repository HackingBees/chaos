var mysql = require('mysql');

function createDBConnection() {

	switch(process.env.NODE_ENV) {
    case 'test':
		return mysql.createPool({
			connectionLimit : 10,
			host: 'localhost',
			user: 'root',
			password: 'H@ckingB33s',
			database: 'chaosdb_test'
		});
        break;
	case 'production':
		var connectString = process.env.CLEARDB_DATABASE_URL;
		var connectParms = connectString.match(/mysql:\/\/(.*):(.*)@(.*)\/(.*)\?reconnect=true/);
		return mysql.createPool({
			connectionLimit : 10,
			host: connectParms[3],
			user: connectParms[1],
			password: connectParms[2],
			database: connectParms[4]
		});
        break;
    default:
		return mysql.createPool({
			connectionLimit : 10,
			host: 'localhost',
			user: 'root',
			password: 'H@ckingB33s',
			database: 'chaosdb'
		});
	}
}

module.exports = function() {
  return createDBConnection;
}

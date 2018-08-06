var mysql = require('mysql');

function createDBConnection() {
	if (!process.env.NODE_ENV) {
		return mysql.createConnection({
		    host: 'localhost',
		    user: 'root',
		    password: 'H@ckingB33s',
		    database: 'chaosdb'
		});
	}
	if (process.env.NODE_ENV == 'test') {
		return mysql.createConnection({
		    host: 'localhost',
		    user: 'root',
		    password: 'H@ckingB33s',
		    database: 'chaosdb_test'
		});
	}
}

module.exports = function() {
  return createDBConnection;
}

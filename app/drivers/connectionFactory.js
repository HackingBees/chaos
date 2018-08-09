var mysql = require('mysql');

function createDBConnection(dbOptions) {

	return mysql.createPool(dbOptions);

}

module.exports = function() {
  return createDBConnection;
}

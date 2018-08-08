function SysUsersDAO(connection) {
	this._connection = connection;
}

SysUsersDAO.prototype.list = function(callback) {
	this._connection.query('SELECT * FROM sys_users', callback);
}

SysUsersDAO.prototype.searchByUserName = function(username, callback) {
	this._connection.query('SELECT * FROM sys_users where `username`=? LIMIT 1', username, callback);
}

SysUsersDAO.prototype.add = function(sysuser, callback) {

	var insert = "INSERT INTO `sys_users` (`username`, `fullname`, `email`, `password`, `active`) values ";
    insert += "('" + sysuser.username + "',";
    insert += "'" + sysuser.fullname + "',";
    insert += "'" + sysuser.email + "',";
    insert += "'" + sysuser.password + "',";
	insert += sysuser.active + ")";
	this._connection.query(insert, callback);
}

SysUsersDAO.prototype.removeById = function(id, callback) {
	this._connection.query("DELETE FROM sys_users WHERE `id`=?", id, callback);
}

SysUsersDAO.prototype.removeByExpression = function(expression, callback) {
	this._connection.query("DELETE FROM sys_users WHERE " + expression, callback);
}

SysUsersDAO.prototype.updateById = function(id, sysuser, callback) {
	var update = "UPDATE sys_users SET ";
	Object.keys(sysuser).forEach(function(key) {
	  var val = sysuser[key];
	  if ((key != "id") && (key != "username")) {
		  if (isNaN(val)) {
			  update+= "`"+key+"`='"+val+"', ";
		  } else {
			  update+= "`"+key+"`="+val+", ";
		  }
	  }
	});
	// remove last comma
	update = update.substring(0, update.length-2);
	update += " WHERE `id`=?";
	this._connection.query(update, id, callback);
}

SysUsersDAO.prototype.truncate = function(callback) {
	this._connection.query("TRUNCATE TABLE sys_users", callback);
}

module.exports = function() {
  return SysUsersDAO;
}

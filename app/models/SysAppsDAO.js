function SysAppsDAO(connection) {
	this._connection = connection;
}

SysAppsDAO.prototype.list = function(callback) {
	this._connection.query('SELECT * FROM sys_apps', callback);
}

SysAppsDAO.prototype.add = function(sysapp, callback) {
	var insert = "INSERT INTO sys_apps (`name`, `description`, `active`) values ";
	insert += "('" + sysapp.name + "',";
	insert += "'" + sysapp.description + "',";
	insert += sysapp.active + ")";
	this._connection.query(insert, callback);
}

SysAppsDAO.prototype.removeById = function(id, callback) {
	this._connection.query("DELETE FROM sys_apps WHERE `id`=?", id, callback);
}

SysAppsDAO.prototype.removeByExpression = function(expression, callback) {
	this._connection.query("DELETE FROM sys_apps WHERE " + expression, callback);
}

SysAppsDAO.prototype.updateById = function(id, sysapp, callback) {
	var update = "UPDATE sys_apps SET ";
	Object.keys(sysapp).forEach(function(key) {
	  var val = sysapp[key];
	  if (key != "id") {
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

SysAppsDAO.prototype.truncate = function(callback) {
	this._connection.query("TRUNCATE TABLE sys_apps", callback);
}

module.exports = function() {
  return SysAppsDAO;
}

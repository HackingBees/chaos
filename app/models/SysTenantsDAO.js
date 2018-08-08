function SysTenantsDAO(connection) {
	this._connection = connection;
}

SysTenantsDAO.prototype.list = function(callback) {
	this._connection.query('SELECT * FROM sys_tenants', callback);
}

SysTenantsDAO.prototype.add = function(systenant, callback) {

	var insert = "INSERT INTO `sys_tenants` (`name`, `schema`, `active`,`deployed`) values ";
	insert += "('" + systenant.name + "',";
	insert += "'t" + Math.floor((Math.random() * 900000000) + 100000000) + "db', false, false)";
	this._connection.query(insert, callback);
}

SysTenantsDAO.prototype.removeById = function(id, callback) {
	this._connection.query("DELETE FROM sys_tenants WHERE `id`=?", id, callback);
}

SysTenantsDAO.prototype.removeByExpression = function(expression, callback) {
	this._connection.query("DELETE FROM sys_tenants WHERE " + expression, callback);
}

SysTenantsDAO.prototype.updateById = function(id, systenant, callback) {
  var update = "UPDATE sys_tenants SET `name`=? WHERE `id`=?";
	this._connection.query(update, systenant.name, id, callback);
}

SysTenantsDAO.prototype.truncate = function(callback) {
	this._connection.query("TRUNCATE TABLE sys_tenants", callback);
}

module.exports = function() {
  return SysTenantsDAO;
}
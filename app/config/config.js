var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
/*var MySQLStore = require('express-mysql-session')(session);*/

module.exports = function() {
	var app = express();

	app.set('view engine','ejs');
	app.set('views','./app/views');
	app.set('trust proxy', 1);
	app.use(express.static('./app'));
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(expressValidator());
	app.use(session({
		key: 'chaos_user_name',
    	secret: 'thisisagreatsecret',
    	resave: true,
    	saveUninitialized: true,
		cookie: { secure: false }
	}));
	consign({cwd: 'app'})
		.include('drivers')
	    .then('models')
	    .then('controllers')
	    .into(app);
	return app;
}

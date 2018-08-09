var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var bcrypt = require('bcrypt');
var MySQLStore = require('express-mysql-session')(session);
var settings = require('./settings.js');

module.exports = function() {
	var app = express();

	app.set('view engine','ejs');
	app.set('views','./app/views');
	app.set('trust proxy', 1);
	app.set('bcrypt',bcrypt);
	app.set('settings', settings);
	app.use(express.static('./app/public'));
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(expressValidator());

	//		store: sessionStore,

	consign({cwd: 'app'})
		.include('drivers')
	    .into(app);

	var dbConnection = app.drivers.connectionFactory(settings.dbOptions);
	/*var sessionStore = new MySQLStore({ createDatabaseTable: true,
										endConnectionOnClose: true},
										dbConnection);
										*/
	var sessionStore = new MySQLStore({}, dbConnection);

	app.use(session({
		store:sessionStore,
		key: 'chaos_user_name',
        secret: 'ThisIsAReallyBigSecret',
        resave: false,
        saveUninitialized: true,
        cookie: { httpOnly: true, secure: false, maxAge: 604800 }
    }));

	consign({cwd: 'app'})
		.include('models')
	    .then('controllers')
	    .into(app);

	app.set('dbConnection',dbConnection);
	app.set('sessionStore',sessionStore);

	app.use(function(req,res,next){
			res.status(404).render('errors/404');
			next();
	});

	app.use(function(error, req,res,next){
		if (settings.env.type == 'production') {
			res.status(500).render('errors/500');
			return;
		}
		next(error);
	});

	return app;
}

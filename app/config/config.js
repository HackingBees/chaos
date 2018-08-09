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

	var sessionStore = new MySQLStore(settings.dbOptions);

	app.use(session({
        store: sessionStore,
		key: 'chaos_user_name',
        secret: settings.env.secret,
        resave: false,
        saveUninitialized: true,
        cookie: settings.env.cookie
    }));

	consign({cwd: 'app'})
		.include('drivers')
	    .then('models')
	    .then('controllers')
	    .into(app);

	var dbConnection = app.drivers.connectionFactory();
	app.set('dbConnection',dbConnection);

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

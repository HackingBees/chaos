var bcrypt = require('bcrypt');

module.exports = function(app) {
    app.get('/sysusers', function (req,res,next) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
     	var connection = app.drivers.connectionFactory();
     	var SysUsersDAO = new app.models.SysUsersDAO(connection);

	    SysUsersDAO.list(function(err, results){
	    	if (err) {
	    		return next(err);
	    	}
	    	res.format({
	    		html: function() {
	    			res.render('sysusers/list',{validationErrors:false, sysuser:{}, list:results});
	    		},
	    		json: function() {
	    			res.json(results);
	    		}
	    	});

	    });
      	connection.end();
    });

	app.get('/sysusers/newSysUser', function (req,res) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
		res.render('sysusers/form',{validationErrors:false, sysuser:{}});
	});

	app.post('/sysusers', function (req,res,next) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
     	var sysuser = req.body;

        req.assert('username','User name is a required attribute.').notEmpty();
        req.assert('fullname','Full name is a required attribute.').notEmpty();
        req.assert('email','Email is a required attribute.').notEmpty();

     	var errors = req.validationErrors();
     	if (errors) {
	    	res.format({
	    		html: function() {
		     		res.status(400).render('sysusers/form',{validationErrors:errors, sysuser:sysuser});
	    		},
	    		json: function() {
	    			res.status(400).json(errors);
	    		}
	    	});
     		return;
     	}

        // not sure this is best practice, still researching on checkboxes
        if (typeof sysuser.active == 'undefined') {
            sysuser.active = false;
        } else if (sysuser.active == 'on') {
            sysuser.active = true;
        } else {
            sysuser.active = false;
        }
        sysuser.password = bcrypt.hashSync(sysuser.password, 10);

     	var connection = app.drivers.connectionFactory();
     	var SysUsersDAO = new app.models.SysUsersDAO(connection);

	    SysUsersDAO.add(sysuser, function(err, results){
	    	if (err) {
	    		return next(err);
	    	}
	    	res.redirect('/sysusers');
	    });

	});
}

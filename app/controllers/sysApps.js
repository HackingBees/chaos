module.exports = function(app) {
    app.get('/sysapps', function (req,res,next) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
     	var SysAppsDAO = new app.models.SysAppsDAO(app.get('connection'));

	    SysAppsDAO.list(function(err, results){
	    	if (err) {
	    		return next(err);
	    	}
	    	res.format({
	    		html: function() {
	    			res.render('sysapps/list',{validationErrors:false, sysapp:{}, list:results});
	    		},
	    		json: function() {
	    			res.json(results);
	    		}
	    	});

	    });
      	connection.end();
    });

	app.get('/sysapps/newSysApp', function (req,res) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
		res.render('sysapps/form',{validationErrors:false, sysapp:{}});
	});

	app.post('/sysapps', function (req,res,next) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
     	var sysapp = req.body;

     	req.assert('name','Name is a required attribute.').notEmpty();

     	var errors = req.validationErrors();
     	if (errors) {
	    	res.format({
	    		html: function() {
		     		res.status(400).render('sysapps/form',{validationErrors:errors, sysapp:sysapp});
	    		},
	    		json: function() {
	    			res.status(400).json(errors);
	    		}
	    	});
     		return;
     	}

        // not sure this is best practice, still researching on checkboxes
        if (typeof sysapp.active == 'undefined') {
            sysapp.active = false;
        } else if (sysapp.active == 'on') {
            sysapp.active = true;
        } else {
            sysapp.active = false;
        }

     	var SysAppsDAO = new app.models.SysAppsDAO(app.get('connection'));

	    SysAppsDAO.add(sysapp, function(err, results){
	    	if (err) {
	    		return next(err);
	    	}
	    	res.redirect('/sysapps');
	    });

	});
}

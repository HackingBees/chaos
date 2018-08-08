module.exports = function(app) {
    app.get('/systenants', function (req,res,next) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
     	var SysTenantsDAO = new app.models.SysTenantsDAO(app.get('connection'));

	    SysTenantsDAO.list(function(err, results){
	    	if (err) {
	    		return next(err);
	    	}
	    	res.format({
	    		html: function() {
	    			res.render('systenants/list',{validationErrors:false, systenant:{}, list:results});
	    		},
	    		json: function() {
	    			res.json(results);
	    		}
	    	});

	    });
      	connection.end();
    });

	app.get('/systenants/newSysTenant', function (req,res) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
		res.render('systenants/form',{validationErrors:false, systenant:{}});
	});

	app.post('/systenants', function (req,res,next) {
        if (req.session.authenticated != true) {
            res.redirect('/login');
        }
     	var systenant = req.body;

     	req.assert('name','Name is a required attribute.').notEmpty();

     	var errors = req.validationErrors();
     	if (errors) {
	    	res.format({
	    		html: function() {
		     		res.status(400).render('systenants/form',{validationErrors:errors, systenant:systenant});
	    		},
	    		json: function() {
	    			res.status(400).json(errors);
	    		}
	    	});
     		return;
     	}

     	var SysTenantsDAO = new app.models.SysTenantsDAO(app.get('connection'));

	    SysTenantsDAO.add(systenant, function(err, results){
	    	if (err) {
	    		return next(err);
	    	}
	    	res.redirect('/systenants');
	    });

	});
}

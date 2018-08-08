module.exports = function(app) {
    app.get('/', function (req,res,next) {
        if (req.session.authenticated == true) {
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }

    });
    app.get('/home', function (req,res,next) {
        var sysuser = req.body;
        if (req.session.authenticated) {
	           res.render('home/home',{validationErrors:false, sysuser:{}});
        } else {
            var message="Unauthorized access. You need to login first.";
            res.status(403).render('home/login',{message:message, validationErrors:false, sysuser:sysuser});
        }
    });
    app.get('/login',function(req,res,next){
        if (req.session.authenticated == true) {
            res.redirect('/home');
        } else {
            res.render('home/login',{message:false, validationErrors:false, sysuser:{}});
        }
    });

    app.post('/login', function(req,res,next) {
        var sysuser = req.body;

        req.assert('username','User name is required.').notEmpty();
        req.assert('password','Password is required.').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            res.format({
                html: function() {
                    res.status(400).render('home/login',{message:false, validationErrors:errors, sysuser:sysuser});
                },
                json: function() {
                    res.status(400).json(errors);
                }
            });
            return;
        }

        var SysUsersDAO = new app.models.SysUsersDAO(app.get('dbConnection'));
	    SysUsersDAO.searchByUserName(sysuser.username, function(err, results){
	    	if (err) {
	    		return next(err);
	    	}
            if (app.get('bcrypt').compareSync(sysuser.password, results[0].password)) {
                req.session.authenticated = true;
                res.status(200).redirect('/home');
            } else {
                var message="Invalid login information.";
                res.status(401).render('home/login',{message:message, validationErrors:false, sysuser:sysuser});
            }
	    });

    });

    app.get('/logout', function (req, res, next) {
        req.session.destroy(function(err) {
             res.redirect('/');
          })
    });

}

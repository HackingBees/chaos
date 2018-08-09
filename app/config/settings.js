// Initialize setings var
var settings = {};
settings.dbOptions = {};
settings.adminUser = {  fullname: 'HackingBees Admin',
                        username: 'admin@hackingbees.tech',
                        email: 'admin@hackingbees.tech',
                        initialPassword: 'admin',
                    };


// Default env settings
settings.env = {
    portNumber: process.env.PORT || 8080,
    secret: 'ThisIsAReallyBigSecret',
    type: 'dev',
    cookie: { httpOnly: true, secure: false, maxAge: 604800 }
};

// Settings that change per env type
switch(process.env.NODE_ENV) {
    case 'test':
        settings.env.type = 'test';
        settings.dbOptions = {  host: 'localhost',
                                user: 'root',
                                password: 'H@ckingB33s',
                                database: 'chaosdb_test',
                                port: 3306
                            };
        break;
    case 'production':
        settings.env.type = 'production';
        settings.env.cookie.secure = true;
        var connectString = process.env.CLEARDB_DATABASE_URL;
        var connectParms = connectString.match(/mysql:\/\/(.*):(.*)@(.*)\/(.*)\?reconnect=true/);
        settings.dbOptions = {  host: connectParms[3],
                                user: connectParms[1],
                                password: connectParms[2],
                                database: connectParms[4]
                            };
        break;
default:
    settings.dbOptions = {  host: 'localhost',
                            user: 'root',
                            password: 'H@ckingB33s',
                            database: 'chaosdb',
                            port: 3306
                        };
}

module.exports = settings;

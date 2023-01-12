const passport = require('passport'),
    LocalStrategy = require('passport-local'),  // define basic HTTP authentication for login requests
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');
    
let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

// define basic HTTP authentication for login requests
passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + ' ' + password);
    Users.findOne({Username: username}, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        if (!user) {
            console.log('incorrect username');
            return callback(null, false, {message: 'Incorrect username.'});
        }
        if (!user.validatePassword(password)) {  //hashes password when logging in
            console.log('incorrect password');
            return callback(null, false, {message: 'Incorrect password.'});
        }
        console.log('finished');
        return callback(null, user);
    });
}));

// authenticate users by the JWT send along with a request
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),	// JWT is extracted from the header of the HTTP request
    secretOrKey: 'your_jwt_secret'	// verify signature
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
        .then((user) => {
					return callback(null, user);
				})
				.catch((error) => {
					return callback(error)
				});
}));
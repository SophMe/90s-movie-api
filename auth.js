const jwtSecret = 'your_jwt_secret'; // text between '' identical to key in JWTStrategy
const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); // my local file

let generateJWToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, // encoded username
        expressIn: '7d', // token expires in 7 days, will have to log in again and get new token
        algorithm: 'HS256' // signature
    });
}

// POST login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right.',
                    user: user
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWToken(user.toJSON());
                return res.json({user, token}); //ES6 shorthand
            });
        })(req,res);
    });
}
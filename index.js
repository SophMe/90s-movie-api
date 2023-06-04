//import Express module locally
const express = require('express'),
	morgan = require('morgan'), //logs to the console
	bodyParser = require('body-parser'),
	uuid = require('uuid'),
	{check, validationResult} = require ('express-validator'); //server-side input validation
//declare variable that encapsulates Express' functionality, will route HTTP requests and responses	
const app = express();

//integrate Mongoose into the REST API
const mongoose = require('mongoose');
const Models = require('./models.js');
	require('dotenv').config();
 
const Movies = Models.Movie; // both defined in models.js
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

//Deprecation warning - suppress
mongoose.set('strictQuery', true);

//allow Mongoose to connect to local database or Atlas
//mongoose.connect('mongodb://localhost:27017/movie-apiDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json()); //MIDDLEWARE will run every time we go to a specific route
app.use(bodyParser.urlencoded({extended: true}));

//cross-origin resource sharing
//default allows requests from all origins
const cors = require('cors');

let allowedOrigins = [ 
  app.use(cors()) //allow request from all origins
  // 'http://localhost:1234', 'https://90s-movies.netlify.app/', 'https://90smovies.vercel.app/', 'http://testsite.com', 'https://en.wikipedia.org', 'https://www.wikipedia.org/'
];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a origin is not on the list of allowed origins
      let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app); // app ensures that Express is available in auth.js as well
const passport = require('passport');
//const { check, validationResult } = require('express-validator');
	require('./passport');


//ROUTES with Express

//READ
//return textual response on /
app.get('/', (req, res) => {
	res.send("This is an API of 90s movies."); //send is an Express function
});

//get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  }
);

//get all users
app.get('/users', passport.authenticate('jwt', { session: false }), function (req, res) {
	  Users.find()
		.then(function (users) {
		  res.status(201).json(users);
		})
		.catch(function (err) {
		  console.error(err);
		  res.status(500).send("Error: " + err);
		});
	}
  );

//one movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({Title: req.params.Title})
		.then((movie) => {
			res.json(movie);
		})
		.catch((err) => {
			console.error.apply(err);
			res.status(500).send("Error: " + err);
		})
});

//genre by name (of genre) 
app.get('/movies/Genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({'Genre.Name': req.params.Name})
		.then((movie) => {
			res.status(201).json(movie.Genre);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//director by name
app.get('/movies/Director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({'Director.Name': req.params.Name})
		.then((movie) => {
			res.status(201).json(movie.Director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//USERS
//CREATE new user with Mongoose
app.post('/users', 
//input validation
	[check('Username', 'Username is required').isLength({min: 5}),
	check('Username', 'Username contains non -alphanumeric characters - not allowed.').isAlphanumeric(),
	check('Password', 'Password is required').not().isEmpty(),
  	check('Email', 'Email does not appear to be valid').isEmail()
	], 
	(req, res) => {
		let errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}
		let hashedPassword = Users.hashPassword(req.body.Password); // hashes password when registering
		Users.findOne({Username: req.body.Username})				// check if user already exists
			.then((user) => {
				if (user) {
					return res.status(400).send(req.body.Username + ' already exists');
				} else {
					Users
						.create({									// if not, create new user
							Username: req.body.Username,			// every key correponds to field specified in schema at models.js
							Password: hashedPassword,
							Email: req.body.Email,
							Birthday: req.body.Birthday
						})
						.then((user) => {res.status(201).json(user)})
						.catch((err) => {
							console.error(err);
							res.status(500).send('Error: ' + err);
						})
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	});

//CREATE (add) movie to favorites 
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, {
		$push: { FavoriteMovies: req.params.MovieID }
	},
	{new: true}, // return updated document
	(err, updatedUser) => {
		if(err) {
			console.error(err);
			res.status(500).send('Error: ' + err);
		} else {
			res.json(updatedUser);
		}
	});
});

//READ
//Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.find()
	  .then((users) => {
		res.status(201).json(users);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
});

//Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOne({Username: req.params.Username})
	  .then((user) => {
		res.json(user);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
});

//UPDATE a user by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  {new: true}, // return updated document
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//DELETE movie from favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({Username: req.params.Username}, {
		$pull: {FavoriteMovies: req.params.MovieID}
	  },
	  {new: true},
	 (err, updatedUser) => {
	   if (err) {
		 console.error(err);
		 res.status(500).send('Error: ' + err);
	   } else {
		 res.json(updatedUser);
	   }
	 });
   });

//DELETE user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//automatically route all requests for static files to their corresponding files within the 'public' folder
app.use(express.static('public'));
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
  });

//log requests using Morgan’s “common” format
app.use(morgan('common'));

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Oops, something went wrong.");
});

//listen for requests
// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
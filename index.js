//import Express module locally
const express = require('express'),
	morgan = require('morgan'), //logs to the console
	bodyParser = require('body-parser'),
	uuid = require('uuid');
//declare variable that encapsulates Express' functionality, will route HTTP requests and responses	
const app = express();

// integrate Mongoose into the REST API
const mongoose = require('mongoose');
const Models = require('./models.js');
 
const Movies = Models.Movie; // both defined in models.js
const Users = Models.User;
const Genre = Models.Genre;
const Director = Models.Director;

// Deprecation warning - suppress
mongoose.set('strictQuery', true);

// allow Mongoose to connect to the database
mongoose.connect('mongodb://127.0.0.1:27017/movie-apiDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json()); //MIDDLEWARE will run every time we go to a specific route
app.use(bodyParser.urlencoded({extended: true}));

let auth = require('./auth')(app); // app ensures that Express is available in auth.js as well
const passport = require('passport');
	require('./passport');

//ROUTES with Express

//READ
//return textual response on /
app.get('/', (req, res) => {
	res.send("This is an API of 90s movies."); //send is an Express function
});

//get all movies
app.get('/movies', (req, res) => {
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
app.get('/users',	function (req, res) {
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

// one movie by title
app.get('/movies/:title', (req, res) => {
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
// !!collection "genres" does not exist!!
app.get('/genre/:Name', (req, res) => {
	const { genreName } = req.params;
	const genre = movies.find(movie => movie.genre.name === genreName).genre;
	if (genre) {
		res.status(200).json(genre);
	} else {
		res.status(400).send('no such genre');
	}
});

//director by name
app.get('/movies/directors/:directorName', (req, res) => {
	const { directorName } = req.params;
	const director = movies.find(movie => movie.director.name === directorName).director;
	if (director) {
		res.status(200).json(director);
	} else {
		res.status(400).send('no such genre');
	}
});

//USERS
//CREATE new user with Mongoose
app.post('/users', (req, res) => {
	Users.findOne({Username: req.body.Username})			// check if user already exists
		.then((user) => {
			if (user) {
				return res.status(400).send(req.body.Username + 'already exists');
			} else {
				Users
					.create({																	// if not, create new user
						Username: req.body.Username,						// every key correponds to field specified in schema at models.js
						Password: req.body.Password,
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

//READ
//Get all users
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  {new: true}, // return the updated document
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//CREATE (add) movie to favorites 
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {
     $push: {FavoriteMovies: req.params.MovieID}
   },
   {new: true}, // return the updated document
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//DELETE movie from favorites !!old
app.delete('/users/:id/:movieTitle', (req, res) => {
	const { id, movieTitle } = req.params;
	
	let user = users.find( user => user.id == id );
	if (user) {
		user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
		res.status(200).send('${movieTitle} has been removed from ${id}\'s array');
	} else {
		res.status(400).send('no such user')
	}
});

//DELETE user
app.delete('/users/:Username', (req, res) => {
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
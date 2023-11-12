//import Express module locally
const express = require('express'),
	morgan = require('morgan'), //logs to the console
	bodyParser = require('body-parser'),
  // busboy = require('busboy'),
	{check, validationResult} = require ('express-validator'); //server-side input validation

const app = express();

//integrate Mongoose into the REST API
const mongoose = require('mongoose');
const Models = require('./models.js');
	require('dotenv').config();

// //AWS S3
const { S3, PutObjectCommand } = require('@aws-sdk/client-s3');
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const Movies = Models.Movie;           // all defined in models.js
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.set('strictQuery', true);    //Deprecation warning - suppress
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});           //allow Mongoose to connect Atlas

app.use(bodyParser.json());           //MIDDLEWARE will run every time we go to a specific route
app.use(bodyParser.urlencoded({extended: true}));
// app.use(busboy());
app.use('/healthcheck', require('./healthcheck.js'));
app.use(fileUpload({ 
  useTempFiles: true,
  tempFileDir: 'temp',
  debug: true
  // limits: { fileSize: 50 * 1024 * 1024 } 
}));
app.use(express.static('public'));

//File size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//CORS
const cors = require('cors');
app.use(cors({})); //allow request from all origins

let auth = require('./auth')(app); // app ensures that Express is available in auth.js as well
const passport = require('passport');
	require('./passport');

// // AWS S3 BUCKET
const s3Config = {
  region: 'eu-central-1',
  // region: 'us-east-1',
  // endpoint: 'http://localhost:4566',
  // forcePathStyle: true
};

const s3Client = new S3(s3Config);
// const listObjectsParams = {
//   Bucket: 'task26-images-bucket'
// };

//ROUTES with Express

//READ
app.get('/', (req, res) => {                      //return textual response on /
	res.send("This is an API of 90s movies.");      //send is an Express function
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
			console.error(err);
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
	[check('Username', 'Username is required').isLength({min: 5}),    //input validation
	check('Username', 'Username contains non -alphanumeric characters - not allowed.').isAlphanumeric(),
	check('Password', 'Password is required').not().isEmpty(),
	check('Email', 'Email does not appear to be valid').isEmail()
	], 
	(req, res) => {
		let errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(422).json({ errors: errors.array() });
			}
		let hashedPassword = Users.hashPassword(req.body.Password);     // hashes password when registering
		Users.findOne({Username: req.body.Username})				            // check if user already exists
			.then((user) => {
				if (user) {
					return res.status(400).send(req.body.Username + ' already exists');
				} else {
					Users
						.create({									          // if not, create new user
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
//GET all users
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

//GET a user by username
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
  let oldData = Users.findOne({ Username: req.params.Username });
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
      Username: req.body.Username || oldData.Username,
      Password: req. body.Password || oldData.Password,
      Email: req.body.Email || oldData.Email,
      Birthday: req.body.Birthday || oldData.Birthday
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

//HANDLE IMAGES
//LIST IMAGES
app.get('/images', (req, res) => {
  const listObjectsParams = {
    Bucket: 'task26-images-bucket',
  };
  listObjectsCmd = new ListObjectsV2Command(listObjectsParams);
  s3Client.send(listObjectsCmd)
    .then((listObjectsResponse) => {
      res.send(listObjectsResponse);
    })
    .catch((err) => {
      console.error('Error', err);
      res.status(500).send('Error listing images in the S3 bucket.');
    });
});

// UPLOAD IMAGES
app.post('/upload', (req, res) => {
  console.log(req.files.files.name, 'typeof: ', typeof req.files )
  
  const file = req.files.files; // Access the uploaded file
  const fileName = req.files.files.name; // Get the file name
  const localTempPath = req.files.files.tempFilePath;
  const originalKey = `original-images/${fileName}`;

    file.mv(localTempPath, (err) => {
    if (err) {
      console.error('Error moving the uploaded image:', err);
      res.status(500).send('Error moving the uploaded image.');
    } else {
      const bucketParams = {
        Bucket: 'task26-images-bucket',
        Key: originalKey,
        Body: fs.createReadStream(localTempPath)
      };

      s3Client
        .send(new PutObjectCommand(bucketParams))
        .then((data) => {
          fs.unlinkSync(localTempPath);
          res.json({ message: 'Image uploaded'});
        })
        .catch((err) => {
          console.error('Error uploading image to S3 bucket:', s3Error);
          res.status(500).send('Error uploading image to S3 bucket.');
        });
    }
  });
});

//SERVER CONFIGURATION AND MIDDLEWARE
//automatically route all requests for static files to their corresponding files within the 'public' folder
app.use(express.static('public'));

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
  });

//log requests using Morgan’s “common” format
app.use(morgan('common'));

//error handling
app.use((err, req, res, next) => {
  console.log('Received request:', req.method, req.url);
  console.error('Error:', err);
  res.status(500).send("Oops, something went wrong.");
});

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
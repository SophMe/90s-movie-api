//import Express module locally
const express = require('express'),
	morgan = require('morgan'), //logs to the console
	bodyParser = require('body-parser'),
	uuid = require('uuid');
//declare variable that encapsulates Express' functionality, will route HTTP requests and responses	
const app = express();

// integrate Mongoose into the REST API
const mongoose = require('mongoose');
const Models = require('.models.js');

const Movies = Models.Movie; // both defined in models.js
const Users = Models.User;

//get all movies with the same genre
//const genre = movies.filter(movie => movie.genre.name === genreName || movie.genre === genreName);

app.use(bodyParser.json()); //MIDDLEWARE will run every time we go to a specific route

let users = [
	{
		id: 1,
		name: "Sophie",
		favoriteMovies: []
	},
	{
		id: 2,
		name: "Teresa",
		favoriteMovies: ["Braveheart"]
	},
	{
		id: 3,
		name: "Kasia",
		favoriteMovies: []
	},
];

let movies = [
	{
		title: "Amercian Beauty",
		year: 1999,
		director: {
			name: "Sam Mendes", 
			birth: 1965.0
		},
		main: "Kevin Spacey",
		genre: {
			name: "Drama",
			description: "Some text",
		},
	},
	{
		title: "Shawshenk Redemption",
		year: 1994,
		director: {
			name: "Frank Darabont", 
			birth: 1959.0
		},
		main: "Tim Robbins",
		genre: {
			name: "Drama",
			description: "Some text",
		},
	},
	{
		title: "Braveheart",
		year: 1995,
		director: {
			name: "Mel Gibson",
			birth: 1956.0
		},
		main: "Mel Gibson",
		genre: {
			name: "Historical drama",
			description: "Some text",
		},
	},
	{
		title: "Forrest Gump",
		year: 1994,
		director: {
			name: "Robert Zemeckis",
			birth: 1952.0
		},
		main: "Tom Hanks",
		genre: "Comedy-drama"
	},
	{
		title: "Fight Club",
		year: 1999,
		director: {
			name: "David Fincher",
			birth: 1962.0
		},
		main: "Brad Pitt",
		genre: "Pycho-thriller"
	},
	{
		title: "The English Patient",
		year: 1996,
		director: {
			name: "Anthony Minghella",
			birth: 1954.0
		},
		main: "Ralph Fiennes",
		genre: "Romantic drama"
	},
	{
		title: "Trainspotting",
		year: 1996,
		director: {
			name: "Danny Boyle",
			birth: 1956.0
		},
		main: "Ewan McGregor",
		genre: "Black comdey-drama"
	},
	{
		title: "Groundhog Day",
		year: 1993,
		director: {
			name: "Joel Coen",
			birth: 1944.0
		},
		main: "Bill Murray",
		genre: "Comedy"
	},
	{
		title: "The Piano",
		year: 1993,
		director: {
			name: "Jane Campion",
			birth: 1954.0
		},
		main: "Holly Hunter",
		genre: "Drama"
	},
	{
		title: "Elizabeth",
		year: 1998,
		director: {
			name: "Shekhar Kapur",
			birth: 1945.0
		},
		main: "Cate Blanchet",
		genre: "Historical drama"
	},
];

//ROUTES with Express
//CREATE new user
app.post('/users', (req, res) => {
	//bodyParser enables us to request from the body object
	const newUser = req.body;
	if (newUser.name) {
		newUser.id = uuid.v4();
		users.push(newUser);
		res.status(201).json(newUser)
	} else {
		res.status(400).send('please enter a name')
	}
});

//UPDATE user name
app.put('/users/:id', (req, res) => {
	const { id } = req.params;
	const updatedUser = req.body;
	let user = users.find( user => user.id == id ); // == because we are looking for a string, thruthy
	if (user) {
		user.name = updatedUser.name;
		res.status(200).json(user);
	} else {
		res.status(400).send('no such user')
	}
});

//DELETE user
app.delete('/users/:id/', (req, res) => {
	const { id } = req.params;
	
	let user = users.find( user => user.id == id );
	if (user) {
		users = users.filter( user => user.id != id);
		res.status(200).send(' user ${id} has been deleted');
	} else {
		res.status(400).send('no such user')
	}
});

//CREATE (add) movie to favorites
app.post('/users/:id/:movieTitle', (req, res) => {
	const { id, movieTitle } = req.params;
	
	let user = users.find( user => user.id == id );
	if (user) {
		user.favoriteMovies.push(movieTitle);
		res.status(200).send('${movieName} has been added to ${id}\'s array');
	} else {
		res.status(400).send('no such user')
	}
});

//DELETE movie from favorites
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

//return JSON object containing movie data
app.get('/movies', (req, res) => {
	res.status(200).json(movies);
});

//return textual response
app.get('/', (req, res) => {
	res.send("This is an API of 90s movies."); //send is an Express function
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

//READ
// one movie by title
app.get('/movies/:title', (req, res) => {
	//const title = req.params.title;
	//object destructuring
	const { title } = req.params;
	const movie = movies.find( movie => movie.title === title );
	if (movie) {
		res.status(200).json(movie);
	} else {
		res.status(400).send('no such movie');
	}
});

//genre by name (of genre)
app.get('/movies/genre/:genreName', (req, res) => {
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

//listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
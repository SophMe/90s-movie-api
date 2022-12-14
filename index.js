//import Express module locally
const express = require('express'),
	morgan = require('morgan'), //logs to the console
	bodyParser = require('body-parser'),
	uuid = require('uuid');
//declare variable that encapsulates Express' functionality, will route HTTP requests and responses	
const app = express();

app.use(bodyParser.json());

let movies = [
	{
		title: "Amercian Beauty",
		director: "Sam Mendes",
		main: "Kevin Spacey",
		genre: "Drama"
	},
	{
		title: "Shawshenk Redemption",
		director: "Frank Darabont",
		main: "Tim Robbins",
		genre: "Drama"
	},
	{
		title: "Braveheart",
		director: "Mel Gibson",
		main: "Mel Gibson",
		genre: "Historical drama"
	},
	{
		title: "Forrest Gump",
		director: "Robert Zemeckis",
		main: "Tom Hanks",
		genre: "Comedy-drama"
	},
	{
		title: "Fight Club",
		director: "David Fincher",
		main: "Brad Pitt",
		genre: "Pycho-thriller"
	},
	{
		title: "The English Patient",
		director: "Anthony Minghella",
		main: "Ralph Fiennes",
		genre: "Romantic drama"
	},
	{
		title: "Trainspotting",
		director: "Danny Boyle",
		main: "Ewan McGregor",
		genre: "Black comdey-drama"
	},
	{
		title: "Groundhog Day",
		director: "Joel Coen",
		main: "Bill Murray",
		genre: "Comedy"
	},
	{
		title: "The Piano",
		director: "Jane Campion",
		main: "Holly Hunter",
		genre: "Drama"
	},
	{
		title: "Elizabeth",
		director: "Shekhar Kapur",
		main: "Cate Blanchet",
		genre: "Historical drama"
	},
];

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

//one genre by name (of genre)
app.get('/movies/genre/:genreName', (req, res) => {
	//const title = req.params.title;
	//object destructuring
	const { genreName } = req.params;
	const genre = movies.find(movie => movie.genre.name === genreName).genre;
	if (genre) {
		res.status(200).json(genre);
	} else {
		res.status(400).send('no such genre');
	}
});

//listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
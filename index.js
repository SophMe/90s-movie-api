//import Express module locally
const express = require('express'),
	morgan = require('morgan'); 
//declare variable that encapsulates Express' functionality, will route HTTP requests and responses	
const app = express();

let topTenMovies = [
	{
		title: "Amercian Beauty",
		director: "Sam Mendes",
		main: "Kevin Spacey",
	},
	{
		title: "Shawshenk Redemption",
		director: "Frank Darabont",
		main: "Tim Robbins",
	},
	{
		title: "Braveheart",
		director: "Mel Gibson",
		main: "Mel Gibson",
	},
	{
		title: "Forrest Gump",
		director: "Robert Zemeckis",
		main: "Tom Hanks",
	},
	{
		title: "Fight Club",
		director: "David Fincher",
		main: "Brad Pitt",
	},
	{
		title: "The English Patient",
		director: "Anthony Minghella",
		main: "Ralph Fiennes",
	},
	{
		title: "Trainspotting",
		director: "Danny Boyle",
		main: "Ewan McGregor",
	},
	{
		title: "Groundhog Day",
		director: "Joel Coen",
		main: "Bill Murray",
	},
	{
		title: "The Piano",
		director: "Jane Campion",
		main: "Holly Hunter",
	},
	{
		title: "Elizabeth",
		director: "Shekhar Kapur",
		main: "Cate Blanchet",
	},
];

//return JSON object containing movie data
app.get('/movies', (req, res) => {
	res.json(topTenMovies);
});

//return textual response
app.get('/', (req, res) => {
	res.send("This is an API of 90s movies.");
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
const mongoose = require('mongoose');


// define schema for collections (movies + users) in MongoDB
let movieSchema = mongoose.Schema({
    // Key: Value,
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}] // reference db.movies collection
});

// create models that use the schemas
let Movie = mongoose.model('Movie', movieSchema); // "Movie" creates the collection "db.movies"
let User = mongoose.model('User', userSchema);

// export models
module.exports.Movie = Movie;
module.exports.User = User;

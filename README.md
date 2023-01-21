# 90s movies API

Description
---

The server-side component of a “movies” web application. The web application provides users with access to information about different movies, directors, and genres. Users will be able to sign up, update their personal information, and create a list of their favorite movies.

Context
---

This REST API interacts with a database and stores data about different movies.

Features
---

*   Return a list of all movies to the user
*   Return data of a single movie by title to the user
*   Return data about a genre (and description) by name (e.g., “Drama”)
*   Return data about a director (birth year, bio) by name
*   Allow new users to register
*   Allow users to update their user info (username)
*   Allow users to add a movie to their list of favorites (showing only a text that a movie has been added)
*   Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed)
*   Allow existing users to deregister (showing only a text that a user email has been removed

URL Endpoints
---

| Request                          | URL           | HTTP Method   | Query Parameters | Request body data format | Response body data format | 
| -------                          | ---           | -----------   | ---------------- | ------------------------ |-------------------- |
| Get a list of all movies         |/movies        | GET           | \-               | None                     | A JSON object holding data about all the movies |
| Get data about a movie by title  |/movies:Title  | GET           | :Title           | None                     | A JSON object holding data about the director |
| Get data about a genre           |/movies/Genre/:Name| GET       | :Name            | None                     | A JSON object holding data about the genre
| Get data about a director by name|/movies/Director/:Name | GET   | :Name            | None                     | A JSON object holding data about a single director
| Allow new user to register       |/users         | POST          | \-               | A JSON object holding data about the user to add, structured like: `{ Username: "examplename", Password: "examplepassword", Email: "user@gmail.com", Birthday: 1980-11-23 }`| A JSON object holding data about the user to add, including an ID: `{ \_id: ObjectId('1'), Username: "examplename", Password: "examplepassword", Email: "user@gmail.com", Birthday: 1980-11-23, FavoriteMovies: \[ \] }`|
| Allow user to log in             |/login         | POST          | \-               | A JSON object holding data about the user to add, structured like: `{ Username: "examplename", Password: "examplepassword" }`| A JSON object holding data about the user to add, including an ID: `{ \_id: ObjectId('1'), Username: "examplename", Password: "examplepassword", Email: "user@gmail.com", Birthday: 1980-11-23, FavoriteMovies: \[ \] }`|
| Allow user to update data        |/users/:Username|UPDATE        | :username        | None A JSON object holding data about the updated information |
| Allow user to add a movie to their favorites|/users/:Username/movies/:MovieID | POST | :username, :movieID | None | A JSON Object holding data about the User and the movie that was added |
| Allow user remove a movie|/users/:Username/movies/:MovieID| DELETE |:username, :movieID | None | A JSON Object holding data about the User and the movie that was removed|
| Allow existing user to deregister |/users/:Username | DELETE     | :username        | None                      | A text message that the movie was successfully removed

Techstack
--- 
* Node.js
* Express

The app uses basic HTTP authentication and JWT (token-based) authentication.

Database
---
The database has been deployed to MongoDB Atlas

Hosting
---
The API is hosted [on Vercel](https://90s-movie-api-git-main-sophme.vercel.app/).
const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http:localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET ALL movie from movie table
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name
    FROM
    movie;`;
  const dbResponse = await db.all(getAllMoviesQuery);
  const responseMovieObj = dbResponse.map((movieObj) => {
    return {
      movieName: movieObj.movie_name,
    };
  });
  response.send(responseMovieObj);
});

//POST A MOVIE

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (
        director_id,
        movie_name,
        lead_actor 
    )
    VALUES (
        ${directorId},
        '${movieName}',
        '${leadActor}'
        );`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET Movie Details
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM
    movie
    WHERE
    movie_id = ${movieId};
    `;
  const movieOb = await db.get(getMovieQuery);
  const movieData = {
    movieId: movieOb.movie_id,
    directorId: movieOb.director_id,
    movieName: movieOb.movie_name,
    leadActor: movieOb.lead_actor,
  };
  response.send(movieData);
});

// PUT movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE movie
  SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
      
  WHERE 
  movie_id =  ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const removeMovieQuery = `
        DELETE FROM movie
        WHERE 
        movie_id = ${movieId}
    ;`;
  await db.run(removeMovieQuery);
  response.send("Movie Removed");
});

//GET ALL directors from director table
app.get("/directors/", async (request, response) => {
  const getAllDirectorQuery = `
    SELECT *
    FROM
    director;`;
  const allDirector = await db.all(getAllDirectorQuery);
  const responseMovieObj = allDirector.map((movieObj) => {
    return {
      directorId: movieObj.director_id,
      directorName: movieObj.director_name,
    };
  });
  response.send(responseMovieObj);
});

//GET ALL movie names  from a director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT *
    FROM
    movie
    WHERE 
    director_id = ${directorId};`;
  const movieList = await db.all(getDirectorMoviesQuery);
  const responseMovieObj = movieList.map((movieObj) => {
    return {
      movieName: movieObj.movie_name,
    };
  });
  response.send(responseMovieObj);
});

module.exports = app;

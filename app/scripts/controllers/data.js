var data = (function () {
    'use strict';

    function userSignUp(newUser) {
        var promise = new Promise(function (resolve, reject) {
            var user = new Parse.User();
            user.setUsername(newUser.username);
            user.setPassword(newUser.password);
            user.setEmail(newUser.email);
            user.set('isSuperUser', newUser._superUser);

            user.signUp(null, {
                success: function (user) {
                    resolve(user);
                },
                error: function (user, error) {
                    reject(error.message);
                }
            })
        });

        return promise;
    }

    function userSignIn(username, password) {
        var promise = new Promise(function (resolve, reject) {
            Parse.User.logIn(username, password, {
                success: function (user) {
                    resolve(user);
                },
                error: function (user, error) {
                    reject(error.message);
                }
            });
        });

        return promise;
    }

    function userIsSignedIn() {
        var currentUser = Parse.User.current();

        if (currentUser === null) {
            return false;
        }

        return true;
    }

    function userCanCreateMovie() {
        var currentUser = Parse.User.current(),
            isSuper;

        if (currentUser === null) {
            return false;
        }

        isSuper = currentUser.get('isSuperUser');

        if (!isSuper) {
            return false;
        }

        return true;
    }

    function userSignOut() {
        var promise = new Promise(function (resolve, reject) {
            Parse.User.logOut();
            resolve('signedOut');
        });

        return promise;
    }

    function addMovieToDataBase(movie) {
        var promise = new Promise(function (resolve, reject) {
            var Movie = Parse.Object.extend('Movie');

            var newMovie = new Movie();
            newMovie.set('title', movie.title);
            newMovie.set('year', movie.year);
            newMovie.set('genre', movie.genre);
            newMovie.set('rating', 0);
            newMovie.set('ratingsCount', 0);
            newMovie.set('director', movie.director);
            newMovie.set('summary', movie.summary);

            resolve(newMovie.save());

        });

        return promise;
    }

    function getAllMovieDetailsFromDataBase() {
        var promise = new Promise(function (resolve, reject) {
            var Movie = Parse.Object.extend('Movie');
            var query = new Parse.Query(Movie);
            var dbMovies = [];
            query.find()
                .then(function (movies) {
                    var id = 0;
                    movies.forEach(function (movie) {
                        var newMovie = {
                            id: ++id,
                            originalId: movie.id,
                            title: movie.get('title'),
                            year: movie.get('year'),
                            genre: movie.get('genre'),
                            rating: movie.get('rating'),
                            director: movie.get('director'),
                            summary: movie.get('summary')
                        };

                        // testing
                        //console.log(newMovie.originalId);

                        dbMovies.push(newMovie);
                    });
                    resolve(dbMovies);
                });
        });

        return promise;
    }

    function setMovieRating(movie, newRating) {
        var promise = new Promise(function (resolve, reject) {
            var Movie = Parse.Object.extend('Movie');
            var query = new Parse.Query(Movie);
            query.get(movie.originalId)
                .then(function (dbMovie) {
                    var rating = +dbMovie.get('rating') + +newRating;
                    var ratingCount = +dbMovie.get('ratingsCount');
                    dbMovie.set('rating', rating/(ratingCount + 1));
                    dbMovie.set('ratingsCount', ratingCount + 1);

                    resolve(dbMovie.save());
                });


        });

        return promise;
    }

    return {
        users: {
            signUp: userSignUp,
            signIn: userSignIn,
            signedIn: userIsSignedIn,
            canCreateMovie: userCanCreateMovie,
            signOut: userSignOut
        },
        movies: {
            addToDataBase: addMovieToDataBase,
            getAllMoviesFromDataBase: getAllMovieDetailsFromDataBase,
            setRating: setMovieRating

        }
    }
}());

export default data;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CCSynchronizer_1 = require("./CCSynchronizer");
const DataProvider_1 = require("./DataProvider");
class Catalog {
    static Initialize() {
        DataProvider_1.DataProvider.Initialize();
        DataProvider_1.DataProvider.listAllMovies()
            .then(response => {
            this._repository.movies = response;
            CCSynchronizer_1.CCSynchronizer.Initialize(true);
        });
    }
    static addMovies(movies) {
        for (let movie of movies.reverse()) {
            if (this.isNew(movie.imdb)) {
                let newMovie = {
                    order: this._repository.movies.length,
                    imdb: movie.imdb,
                    magnet: movie.magnet
                };
                this._repository.movies.unshift(newMovie);
                DataProvider_1.DataProvider.addMovie(newMovie);
            }
        }
    }
    static getTop10Movies() {
        return this._repository.movies.slice(0, 10);
    }
    static listMetas(skip = 0) {
        let metas = [];
        for (let movie of this._repository.movies) {
            metas.push({
                id: movie.imdb,
                type: "movie",
                isFree: true,
            });
        }
        return metas.slice(skip, Number(skip) + 100);
    }
    static getStream(imdb) {
        for (let movie of this._repository.movies) {
            if (movie.imdb === imdb) {
                return [movie.magnet];
            }
        }
        return [];
    }
    static isNew(imdb) {
        for (let movie of this._repository.movies) {
            if (movie.imdb === imdb) {
                return false;
            }
        }
        return true;
    }
}
Catalog._repository = { movies: [] };
exports.Catalog = Catalog;
//# sourceMappingURL=Catalog.js.map
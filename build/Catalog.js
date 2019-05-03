"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const CCSynchronizer_1 = require("./CCSynchronizer");
class Catalog {
    static Initialize() {
        this._repository.movies = require("../data/movies.json");
        CCSynchronizer_1.CCSynchronizer.Initialize();
    }
    static addMovies(movies) {
        for (let movie of movies.reverse()) {
            if (this.isNew(movie.imdb)) {
                this._repository.movies.unshift({
                    order: this._repository.movies.length,
                    imdb: movie.imdb,
                    magnet: movie.magnet
                });
            }
        }
        fs.writeFileSync("./data/movies.json", JSON.stringify(this._repository.movies));
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
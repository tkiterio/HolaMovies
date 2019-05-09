"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CCSynchronizer_1 = require("./CCSynchronizer");
const DataProvider_1 = require("./DataProvider");
class Catalog {
    static Initialize() {
        DataProvider_1.DataProvider.Initialize()
            .then(() => {
            DataProvider_1.DataProvider.listAllMovies()
                .then(response => {
                this._repository.movies = response;
                CCSynchronizer_1.CCSynchronizer.Initialize(true);
            });
        });
    }
    static addMovies(movies) {
        for (let movie of movies) {
            if (this.isNew(movie.imdb)) {
                if (movie.hasOwnProperty("meta")) {
                    let newMovie = {};
                    newMovie.id = movie.imdb;
                    newMovie.name = movie.meta.name;
                    newMovie.release_date = movie.meta.release_date || movie.meta.released || movie.meta.dvdRelease;
                    newMovie.runtime = movie.meta.runtime;
                    newMovie.type = movie.meta.type;
                    newMovie.year = movie.meta.year;
                    newMovie.info_hash = movie.magnet.infoHash;
                    newMovie.sources = JSON.stringify(movie.magnet.sources);
                    newMovie.tags = JSON.stringify(movie.magnet.tag);
                    newMovie.title = movie.magnet.title;
                    this._repository.movies.push(newMovie);
                    DataProvider_1.DataProvider.addMovie(newMovie);
                }
            }
        }
    }
    static getTop10Movies() {
        return this._repository.movies.slice(0, 10);
    }
    static listMetas(extra = {}) {
        let metas = [];
        for (let movie of this._repository.movies) {
            metas.push({
                id: movie.imdb,
                type: "movie",
                isFree: true,
            });
        }
        // if (extra.search) {
        //     let movies: any = [];
        //     console.log("STARTED");
        //
        //     metas.forEach(async (meta: any) => {
        //         movies.push({
        //             imdb: meta.id,
        //             meta: await DataProvider.getMovieMeta(meta.id)
        //         })
        //
        //         if (movies.length === metas.length) {
        //             require("fs").writeFileSync("./metasInfo.json", JSON.stringify(movies), "utf8");
        //         }
        //     });
        // }
        return metas.slice(extra.skip || 0, Number(extra.skip || 0) + 100);
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
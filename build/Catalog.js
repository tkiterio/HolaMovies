"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const Synchronizer_1 = require("./Synchronizer");
const DataProvider_1 = require("./DataProvider");
const Movie_1 = require("./Movie");
class Catalog {
    static Initialize() {
        DataProvider_1.DataProvider.Initialize()
            .then(() => {
            DataProvider_1.DataProvider.listAllMovies()
                .then(response => {
                this._movies = response;
                Synchronizer_1.Synchronizer.Initialize(true);
            });
        })
            .catch(() => {
            request.get(process.env.JSON_DATA_URL, (error, response, data) => {
                data = JSON.parse(data);
                data.values.forEach((value) => {
                    let row = {};
                    for (let i = 0; i < value.length; i++) {
                        row[data.fields[i]] = value[i];
                    }
                    this._movies.push(new Movie_1.Movie(row));
                });
            });
        });
    }
    static addMovie(movie) {
        if (this.isNew(movie.id)) {
            this._movies.unshift(movie);
        }
    }
    static getTop10Movies() {
        return this._movies.slice(0, 10);
    }
    static listMetas(extra = {}) {
        let metas = [];
        if (extra.search) {
            this._movies.filter(movie => {
                if (movie.data.name.toLowerCase().includes(extra.search.toLowerCase())) {
                    metas.push(movie.meta);
                }
            });
        }
        else {
            for (let movie of this._movies) {
                metas.push(movie.meta);
            }
        }
        return metas.slice(extra.skip || 0, Number(extra.skip || 0) + 100);
    }
    static getStream(id) {
        for (let movie of this._movies) {
            if (movie.id === id) {
                return [movie.magnet];
            }
        }
        return [];
    }
    static isNew(id) {
        for (let movie of this._movies) {
            if (movie.id === id) {
                return false;
            }
        }
        return true;
    }
}
Catalog._movies = [];
exports.Catalog = Catalog;
//# sourceMappingURL=Catalog.js.map
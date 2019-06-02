"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const Movie_1 = require("./Movie");
const firebase_admin_1 = require("firebase-admin");
class DataProvider {
    static Initialize() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this._client = new pg_1.Client({
                    connectionString: process.env.DATABASE_URL,
                    ssl: true,
                });
                yield this._client.connect();
                let serviceAccount = {};
                if (process.env.FIREBASE_CREDENTIALS) {
                    console.log(process.env.FIREBASE_CREDENTIALS);
                    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
                }
                else {
                    serviceAccount = require(process.env.FIREBASE_CREDENTIALS_LOCAL);
                }
                firebase_admin_1.initializeApp({
                    credential: firebase_admin_1.credential.cert(serviceAccount),
                    databaseURL: process.env.FIREBASE_DATABASE_URL
                });
                this._dbRefLogs = firebase_admin_1.database().ref("logs");
                resolve();
            }
            catch (e) {
                reject();
            }
        }));
    }
    static listAllMovies() {
        return new Promise(resolve => {
            this._client.query('SELECT * FROM holamovies.imdb_movies ORDER BY position DESC;', (err, res) => {
                if (!err) {
                    let movies = [];
                    for (let data of res.rows) {
                        movies.push(new Movie_1.Movie(data));
                    }
                    resolve(movies);
                }
                else {
                    resolve([]);
                }
            });
        });
    }
    static addMovie(movie) {
        this._client.query(`INSERT INTO holamovies.imdb_movies (id, name, release_date, runtime, type, "year", info_hash, sources, tags, title, poster) VALUES (${movie.insertString})`, (err, res) => {
            if (err) {
                console.log("Error creating new movie");
                console.log(err);
            }
        });
    }
    static updatePoster(movie) {
        this._client.query(`UPDATE holamovies.imdb_movies SET poster = '${movie.data.poster}' WHERE id = '${movie.id}'`, (err, res) => {
            if (err) {
                console.log("Error creating new movie");
                console.log(err);
            }
        });
    }
    static log(type, payload) {
        if (this._dbRefLogs) {
            this._dbRefLogs.push().set({ type, payload });
        }
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=DataProvider.js.map
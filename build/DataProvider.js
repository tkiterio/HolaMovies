"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const Stremio = require("stremio-addons");
class DataProvider {
    static Initialize() {
        return new Promise((resolve, reject) => {
            try {
                this._client = new pg_1.Client({
                    connectionString: process.env.DATABASE_URL,
                    ssl: true,
                });
                this._client.connect();
                this._addons = new Stremio.Client();
                this._addons.add(this._cinemataEndpoint);
                // this._client.query(`UPDATE holamovies.movies set meta = ''`, (err: any, res: any) => {});
                resolve();
            }
            catch (e) {
                reject();
            }
        });
    }
    static listAllMovies() {
        return new Promise(resolve => {
            this._client.query('SELECT * FROM holamovies.movies ORDER BY id DESC;', (err, res) => {
                if (!err) {
                    let movies = [];
                    for (let movie of res.rows) {
                        movies.push({
                            order: movie.id,
                            imdb: movie.imdb,
                            magnet: {
                                type: movie.source_type,
                                infoHash: movie.info_hash,
                                sources: movie.sources,
                                tag: movie.tags,
                                title: movie.title
                            }
                        });
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
        let data = `'${movie.imdb}','${movie.magnet.type}','${movie.magnet.infoHash}','${JSON.stringify(movie.magnet.sources)}','${JSON.stringify(movie.magnet.tag)}','${movie.magnet.title}'`;
        this._client.query(`INSERT INTO holamovies.movies (imdb, source_type, info_hash, sources, tags, title) VALUES (${data})`, (err, res) => {
            if (err) {
                console.log("Error creating new movie");
                console.log(err);
            }
        });
    }
    static getMovieMeta(imdb) {
        return new Promise(resolve => {
            this._addons.meta.get({ query: { imdb_id: imdb } }, (error, meta) => {
                if (error) {
                    resolve({});
                }
                else {
                    resolve(meta);
                }
            });
        });
    }
    static addMovieMeta(movies) {
        let movie = movies[0];
        this._client.query(`UPDATE holamovies.movies set meta = '${JSON.stringify(movie.meta)}' WHERE imdb = '${movie.imdb}'`, (err, res) => {
            if (err) {
                console.log("Error updating movie", "|", movie.imdb);
                console.log(err);
            }
            movies.splice(0, 1);
            this.addMovieMeta(movies);
        });
    }
}
DataProvider._cinemataEndpoint = "http://cinemeta.strem.io/stremioget/stremio/v1";
exports.DataProvider = DataProvider;
//# sourceMappingURL=DataProvider.js.map
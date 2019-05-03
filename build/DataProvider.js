"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
class DataProvider {
    static Initialize() {
        this._client = new pg_1.Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
        this._client.connect();
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
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=DataProvider.js.map
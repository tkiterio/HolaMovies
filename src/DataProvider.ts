import {Client} from "pg";

const Stremio = require("stremio-addons");

export class DataProvider {

    private static _client: any;
    private static _cinemataEndpoint = "http://cinemeta.strem.io/stremioget/stremio/v1";
    private static _addons: any;

    public static Initialize(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this._client = new Client({
                    connectionString: process.env.DATABASE_URL,
                    ssl: true,
                });

                this._client.connect();
                this._addons = new Stremio.Client();
                this._addons.add(this._cinemataEndpoint);
                // this._client.query(`UPDATE holamovies.movies set meta = ''`, (err: any, res: any) => {});

                resolve();
            } catch (e) {
                reject();
            }
        })
    }

    public static listAllMovies(): Promise<any> {
        return new Promise(resolve => {
            this._client.query('SELECT * FROM holamovies.movies ORDER BY id DESC;', (err: any, res: any) => {
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
                        })
                    }
                    resolve(movies);
                } else {
                    resolve([]);
                }
            });
        })
    }

    public static addMovie(movie: any): void {
        let data = `'${movie.id}','${movie.name}','${movie.release_date}','${movie.runtime}','${movie.type}','${movie.year}','${movie.info_hash}','${movie.sources}','${movie.tags}','${movie.title}'`;
        this._client.query(`INSERT INTO holamovies.imdb_movies (id, name, release_date, runtime, type, "year", info_hash, sources, tags, title) VALUES (${data})`, (err: any, res: any) => {
            if (err) {
                console.log("Error creating new movie");
                console.log(err);
            }
        });
    }

    public static getMovieMeta(imdb: string): Promise<any> {
        return new Promise(resolve => {
            this._addons.meta.get({query: {imdb_id: imdb}}, (error: any, meta: any) => {
                if (error) {
                    resolve({})
                } else {
                    resolve(meta);
                }
            });
        });
    }

    public static addMovieMeta(movies: any) {
        let movie = movies[0];
        this._client.query(`UPDATE holamovies.movies set meta = '${JSON.stringify(movie.meta)}' WHERE imdb = '${movie.imdb}'`, (err: any, res: any) => {
            if (err) {
                console.log("Error updating movie", "|", movie.imdb);
                console.log(err);
            }
            movies.splice(0, 1);
            this.addMovieMeta(movies);
        });
    }
}

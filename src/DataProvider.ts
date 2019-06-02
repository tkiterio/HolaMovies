import {Client} from "pg";
import {Movie} from "./Movie";
import {initializeApp, credential, database} from "firebase-admin";

export class DataProvider {

    private static _client: any;
    private static _dbRefLogs: any;

    public static Initialize(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                this._client = new Client({
                    connectionString: process.env.DATABASE_URL,
                    ssl: true,
                });

                await this._client.connect();

                let serviceAccount = {};

                if (process.env.FIREBASE_CREDENTIALS) {
                    serviceAccount = process.env.FIREBASE_CREDENTIALS;
                } else {
                    serviceAccount = require(process.env.FIREBASE_CREDENTIALS_LOCAL);
                }

                initializeApp({
                    credential: credential.cert(serviceAccount),
                    databaseURL: process.env.FIREBASE_DATABASE_URL
                });

                this._dbRefLogs = database().ref("logs");

                resolve();
            } catch (e) {
                reject();
            }
        })
    }

    public static listAllMovies(): Promise<any> {
        return new Promise(resolve => {
            this._client.query('SELECT * FROM holamovies.imdb_movies ORDER BY position DESC;', (err: any, res: any) => {
                if (!err) {
                    let movies: Movie[] = [];
                    for (let data of res.rows) {
                        movies.push(new Movie(data));
                    }
                    resolve(movies);
                } else {
                    resolve([]);
                }
            });
        })
    }

    public static addMovie(movie: Movie): void {
        this._client.query(`INSERT INTO holamovies.imdb_movies (id, name, release_date, runtime, type, "year", info_hash, sources, tags, title, poster) VALUES (${movie.insertString})`, (err: any, res: any) => {
            if (err) {
                console.log("Error creating new movie");
                console.log(err);
            }
        });
    }

    public static updatePoster(movie: Movie): void {
        this._client.query(`UPDATE holamovies.imdb_movies SET poster = '${movie.data.poster}' WHERE id = '${movie.id}'`, (err: any, res: any) => {
            if (err) {
                console.log("Error creating new movie");
                console.log(err);
            }
        });
    }

    public static log(type: string, payload: any): void {
        this._dbRefLogs.push().set({type, payload});
    }
}

import {Client} from "pg";

export class DataProvider {

    private static _client: any;

    public static Initialize() {
        this._client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });

        this._client.connect();
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
        let data = `'${movie.imdb}','${movie.magnet.type}','${movie.magnet.infoHash}','${JSON.stringify(movie.magnet.sources)}','${JSON.stringify(movie.magnet.tag)}','${movie.magnet.title}'`;
        this._client.query(`INSERT INTO holamovies.movies (imdb, source_type, info_hash, sources, tags, title) VALUES (${data})`, (err: any, res: any) => {
            if (err) {
                console.log("Error creating new movie");
                console.log(err);
            }
        });
    }
}

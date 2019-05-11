import * as request from "request";
import {Synchronizer} from "./Synchronizer";
import {DataProvider} from "./DataProvider";
import {Movie} from "./Movie";


export class Catalog {

    private static _movies: Movie[] = [];

    public static Initialize(): void {
        DataProvider.Initialize()
            .then(() => {
                DataProvider.listAllMovies()
                    .then(response => {
                        this._movies = response;
                        Synchronizer.Initialize(true);
                    });
            })
            .catch(() => {
                request.get(process.env.JSON_DATA_URL, (error, response, data) => {
                    data = JSON.parse(data);
                    data.values.forEach((value: any) => {
                        let row: any = {};
                        for (let i = 0; i < value.length; i++) {
                            row[data.fields[i]] = value[i];
                        }
                        this._movies.push(new Movie(row));
                    });
                })
            })
    }

    public static addMovie(movie: Movie) {
        if (this.isNew(movie.id)) {
            this._movies.unshift(movie);
        }
    }

    public static getTop10Movies(): any {
        return this._movies.slice(0, 10);
    }

    public static listMetas(extra: any = {}): any {
        let metas: any = [];

        if (extra.search) {
            this._movies.filter(movie => {
                if (movie.data.name.toLowerCase().includes(extra.search.toLowerCase())) {
                    metas.push(movie.meta);
                }
            });
        } else {
            for (let movie of this._movies) {
                metas.push(movie.meta);
            }
        }

        return metas.slice(extra.skip || 0, Number(extra.skip || 0) + 100);
    }

    public static getStream(id: string): any {
        for (let movie of this._movies) {
            if (movie.id === id) {
                return [movie.magnet];
            }
        }
        return [];
    }

    private static isNew(id: string): boolean {
        for (let movie of this._movies) {
            if (movie.id === id) {
                return false;
            }
        }

        return true;
    }
}

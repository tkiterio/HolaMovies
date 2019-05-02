import * as fs from "fs";
import {CCSynchronizer} from "./CCSynchronizer";

export class Catalog {

    private static _repository: any = {movies: []};

    public static Initialize(): void {
        this._repository.movies = require("../data/movies.json");
        CCSynchronizer.Initialize();
    }

    public static forceUpdate(): void {
        CCSynchronizer.Initialize(true);
    }

    public static addMovies(movies: any[]) {

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

    public static getTop10Movies(): any {
        return this._repository.movies.slice(0, 10);
    }

    public static listMetas(): any {
        let metas: any = [];

        for (let movie of this._repository.movies) {
            metas.push({
                id: movie.imdb,
                type: "movie",
                "isFree": true,
            })
        }

        return metas;
    }

    public static getStream(imdb: string): any {
        for (let movie of this._repository.movies) {
            if (movie.imdb === imdb) {
                return [movie.magnet];
            }
        }
        return [];
    }

    private static isNew(imdb: string): boolean {
        for (let movie of this._repository.movies) {
            if (movie.imdb === imdb) {
                return false;
            }
        }

        return true;
    }
}

import {CCSynchronizer} from "./CCSynchronizer";
import {DataProvider} from "./DataProvider";

export class Catalog {

    private static _repository: any = {movies: []};

    public static Initialize(): void {
        DataProvider.Initialize();
        DataProvider.listAllMovies()
            .then(response => {
                this._repository.movies = response;
                CCSynchronizer.Initialize(true);
            })
    }

    public static addMovies(movies: any[]) {

        for (let movie of movies.reverse()) {
            if (this.isNew(movie.imdb)) {

                let newMovie = {
                    order: this._repository.movies.length,
                    imdb: movie.imdb,
                    magnet: movie.magnet
                };

                this._repository.movies.unshift(newMovie);
                DataProvider.addMovie(newMovie);
            }
        }
    }

    public static getTop10Movies(): any {
        return this._repository.movies.slice(0, 10);
    }

    public static listMetas(skip: number = 0): any {
        let metas: any = [];

        for (let movie of this._repository.movies) {
            metas.push({
                id: movie.imdb,
                type: "movie",
                isFree: true,
            })
        }

        return metas.slice(skip, Number(skip) + 100);
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

import {CCSynchronizer} from "./CCSynchronizer";
import {DataProvider} from "./DataProvider";


export class Catalog {

    private static _repository: any = {movies: []};


    public static Initialize(): void {
        DataProvider.Initialize()
            .then(() => {
                DataProvider.listAllMovies()
                    .then(response => {
                        this._repository.movies = response;
                        CCSynchronizer.Initialize(true);
                    });
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

    public static listMetas(extra: any = {}): any {
        let metas: any = [];

        for (let movie of this._repository.movies) {
            metas.push({
                id: movie.imdb,
                type: "movie",
                isFree: true,
            });


        }

        // if (extra.search) {
        //     let movies: any = [];
        //     console.log("STARTED");
        //
        //     metas.forEach(async (meta: any) => {
        //         movies.push({
        //             imdb: meta.id,
        //             meta: await DataProvider.getMovieMeta(meta.id)
        //         })
        //
        //         if (movies.length === metas.length) {
        //             require("fs").writeFileSync("./metasInfo.json", JSON.stringify(movies), "utf8");
        //         }
        //     });
        // }

        return metas.slice(extra.skip || 0, Number(extra.skip || 0) + 100);
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

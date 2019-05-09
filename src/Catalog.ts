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

        for (let movie of movies) {
            if (this.isNew(movie.imdb)) {
                if (movie.hasOwnProperty("meta")) {
                    let newMovie: any = {};
                    newMovie.id = movie.imdb;
                    newMovie.name = movie.meta.name;
                    newMovie.release_date = movie.meta.release_date || movie.meta.released || movie.meta.dvdRelease;
                    newMovie.runtime = movie.meta.runtime;
                    newMovie.type = movie.meta.type;
                    newMovie.year = movie.meta.year;
                    newMovie.info_hash = movie.magnet.infoHash;
                    newMovie.sources = JSON.stringify(movie.magnet.sources);
                    newMovie.tags = JSON.stringify(movie.magnet.tag);
                    newMovie.title = movie.magnet.title;

                    this._repository.movies.push(newMovie);
                    DataProvider.addMovie(newMovie);
                }
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

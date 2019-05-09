async function getMeta(tt) {
    var CINEMETA_ENDPOINT = "http://cinemeta.strem.io/stremioget/stremio/v1";

    var Stremio = require("stremio-addons");
    var addons = new Stremio.Client();
    addons.add(CINEMETA_ENDPOINT);

    return new Promise((resolve, reject) => {
        addons.meta.get({query: {imdb_id: tt}}, function (err, meta) {
            resolve(meta);
        });
    })

}

async function main() {
    let movies = require("./newData");
    let proceced = {};
    for (let movie of movies) {
        if (movie.hasOwnProperty("meta")) {
            if (!proceced.hasOwnProperty(movie.imdb)) {
                if (!movie.meta.hasOwnProperty("name")) {
                    movie.meta = await getMeta(movie.imdb);
                }
                let data = {};
                data.id = movie.imdb;
                data.name = movie.meta.name;
                data.release_date = movie.meta.release_date || movie.meta.released || movie.meta.dvdRelease;
                data.runtime = movie.meta.runtime;
                data.type = movie.meta.type;
                data.year = movie.meta.year;
                data.info_hash = movie.magnet.infoHash;
                data.sources = JSON.stringify(movie.magnet.sources);
                data.tags = JSON.stringify(movie.magnet.tag);
                data.title = movie.magnet.title;

                proceced[data.id] = true;
                require("fs").appendFileSync("./data2Upload.txt", Object.values(data).join(";") + "\n", "utf8");
            }
        }
        /**
         * id
         * name
         * release_date || released || dvdRelease
         * runtime
         * type
         * year
         * info_hash
         * sources
         * tags
         * title
         */
    }
}

main();



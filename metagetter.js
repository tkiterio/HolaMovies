var CINEMETA_ENDPOINT = "http://cinemeta.strem.io/stremioget/stremio/v1";

var Stremio = require("stremio-addons");
var addons = new Stremio.Client();
addons.add(CINEMETA_ENDPOINT);

addons.meta.get({ query: { imdb_id: "tt2386490" } }, function(err, meta) {
    console.log(meta);
});

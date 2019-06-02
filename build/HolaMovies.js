"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Catalog_1 = require("./Catalog");
const manifest = require("../manifest.json");
class HolaMovies {
    constructor() {
        Catalog_1.Catalog.Initialize();
    }
    catalogHandler(request) {
        return Promise.resolve({ metas: (request.type === "movie" && request.id === "top") ? Catalog_1.Catalog.listMetas(request.extra) : [] });
    }
    streamHandler(request) {
        return Promise.resolve({ streams: (request.type === "movie") ? Catalog_1.Catalog.getStream(request.id) : [] });
    }
    getManifest() {
        return manifest;
    }
}
exports.HolaMovies = HolaMovies;
//# sourceMappingURL=HolaMovies.js.map
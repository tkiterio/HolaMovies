"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Catalog_1 = require("./Catalog");
const SDK = require("stremio-addon-sdk");
const manifest = require("../manifest.json");
class HolaMovies {
    constructor() {
        this._builder = new SDK.addonBuilder(manifest);
        this.defineCatalogHandler();
        this.defineStreamHandler();
        Catalog_1.Catalog.Initialize();
    }
    defineCatalogHandler() {
        this._builder.defineCatalogHandler((request) => {
            return Promise.resolve({ metas: (request.type === "movie" && request.id === "top") ? Catalog_1.Catalog.listMetas(request.extra.skip) : [] });
        });
    }
    defineStreamHandler() {
        this._builder.defineStreamHandler((request) => {
            return Promise.resolve({ streams: (request.type === "movie") ? Catalog_1.Catalog.getStream(request.id) : [] });
        });
    }
    getInterface() {
        return this._builder.getInterface();
    }
}
exports.HolaMovies = HolaMovies;
//# sourceMappingURL=HolaMovies.js.map
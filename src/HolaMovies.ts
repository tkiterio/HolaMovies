import {Catalog} from "./Catalog";

const SDK = require("stremio-addon-sdk");
const manifest = require("../manifest.json");

export class HolaMovies {

    private _builder: any;

    constructor() {
        this._builder = new SDK.addonBuilder(manifest);
        this.defineCatalogHandler();
        this.defineStreamHandler();
        Catalog.Initialize();
    }

    private defineCatalogHandler(): void {
        this._builder.defineCatalogHandler((request: any) => {
            return Promise.resolve({metas: (request.type === "movie" && request.id === "top") ? Catalog.listMetas(request.extra) : []});
        });
    }

    private defineStreamHandler(): void {
        this._builder.defineStreamHandler((request: any) => {
            return Promise.resolve({streams: (request.type === "movie") ? Catalog.getStream(request.id) : []})
        });
    }

    public getInterface(): any {
        return this._builder.getInterface();
    }
}

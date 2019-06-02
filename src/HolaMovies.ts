import {Catalog} from "./Catalog";

const manifest = require("../manifest.json");

export class HolaMovies {

    constructor() {
        Catalog.Initialize();
    }

    public catalogHandler(request: any): Promise<any> {
        return Promise.resolve({metas: (request.type === "movie" && request.id === "top") ? Catalog.listMetas(request.extra) : []});
    }

    public streamHandler(request: any): Promise<any> {
        return Promise.resolve({streams: (request.type === "movie") ? Catalog.getStream(request.id) : []})
    }

    public getManifest(): any {
        return manifest;
    }
}

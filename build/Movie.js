"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Catalog_1 = require("./Catalog");
const DataProvider_1 = require("./DataProvider");
class Movie {
    constructor(data) {
        this._data = data;
    }
    get id() {
        return this._data.id;
    }
    get meta() {
        return {
            id: this._data.id,
            name: this._data.name,
            type: this._data.type,
            isFree: true,
        };
    }
    get magnet() {
        return {
            type: this._data.type,
            infoHash: this._data.info_hash,
            sources: this._data.sources,
            tag: this._data.tags,
            title: this._data.title
        };
    }
    get insertString() {
        return `'${this._data.id}','${this._data.name}','${this._data.release_date}','${this._data.runtime}','${this._data.type}','${this._data.year}','${this._data.info_hash}','${JSON.stringify(this._data.sources)}','${JSON.stringify(this._data.tags)}','${this._data.title}'`;
    }
    get data() {
        return this._data;
    }
    save() {
        Catalog_1.Catalog.addMovie(this);
        DataProvider_1.DataProvider.addMovie(this);
    }
}
exports.Movie = Movie;
//# sourceMappingURL=Movie.js.map
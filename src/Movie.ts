import {Catalog} from "./Catalog";
import {DataProvider} from "./DataProvider";

export class Movie {

    private readonly _data: any;

    constructor(data: any) {
        this._data = data;
    }

    get id(): string {
        return this._data.id;
    }

    get meta(): any {
        return {
            id: this._data.id,
            imdb_id: this._data.id,
            type: this._data.type,
            name: this._data.name,
            releaseInfo: this._data.year,
            poster: `https://images.metahub.space/poster/small/${this._data.id}/img`
        };
    }

    get magnet(): any {
        return {
            name: this._data.name,
            type: this._data.type,
            infoHash: this._data.info_hash,
            sources: this._data.sources,
            tag: this._data.tags,
            title: this._data.title
        }
    }

    get insertString(): string {
        return `'${this._data.id}','${this._data.name}','${this._data.release_date}','${this._data.runtime}','${this._data.type}','${this._data.year}','${this._data.info_hash}','${JSON.stringify(this._data.sources)}','${JSON.stringify(this._data.tags)}','${this._data.title}'`;
    }

    get data(): any {
        return this._data;
    }

    save() {
        Catalog.addMovie(this);
        DataProvider.addMovie(this);
    }
}

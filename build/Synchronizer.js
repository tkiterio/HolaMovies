"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const cheerio = require("cheerio");
const magnet = require("magnet-uri");
const Catalog_1 = require("./Catalog");
const cron_1 = require("cron");
const Movie_1 = require("./Movie");
const Stremio = require("stremio-addons");
class Synchronizer {
    static Initialize(runNow = false) {
        new cron_1.CronJob(process.env.CRON_EXPRESSION || '1 1 * * * *', () => {
            this.run();
        }, null, true);
        if (runNow) {
            this.run();
        }
        this._addons = new Stremio.Client();
        this._addons.add(this._cinemataEndpoint);
    }
    static run() {
        this._forceFinish = false;
        this._page = 1;
        this._lastScrappedMovie = Catalog_1.Catalog.getTop10Movies();
        this.getPage(this._url + this._page);
    }
    static getPage(url) {
        if (this._forceFinish) {
            this._working.gettingPage = false;
            this.scrapTorrents();
        }
        else if (!this._working.gettingPage) {
            this._working.gettingPage = true;
            request.get(url, { timeout: 5000 }, (error, response, html) => {
                if (error) {
                    throw error;
                }
                else {
                    if (html.includes("No se encontró la dirección") || this._page > this._maxPage) {
                        this._working.gettingPage = false;
                        this.scrapTorrents();
                    }
                    else {
                        let $ = cheerio.load(html);
                        let posts = $("#main_container .home_post_cont");
                        for (let i = 0; i < posts.length; i++) {
                            this._repositoryPages.tail.push(posts[i].children[1].attribs.href);
                        }
                        this._working.gettingPage = false;
                        this._page++;
                        this.scrapDetails();
                    }
                }
            });
        }
    }
    static scrapDetails() {
        if (!this._working.scrapDetails) {
            if (this._repositoryPages.tail.length > 0) {
                console.log(`Getting details from page ${this._page - 1} movie ${this._repositoryPages.done.length + 1}`);
                this._working.scrapDetails = true;
                let url = this._repositoryPages.tail[0];
                try {
                    request.get({
                        uri: url,
                        timeout: 15000
                    }, (error, response, html) => {
                        if (error) {
                            console.error(`Get detail fail for ${url}`);
                            this._repositoryPages.failed.push(url);
                            this._repositoryPages.tail.splice(0, 1);
                            this._working.scrapDetails = false;
                            this.scrapDetails();
                        }
                        else {
                            let $ = cheerio.load(html);
                            let linkList = $("#main_container #panel_descarga .linklist")[0].children;
                            for (let i = 0; i < linkList.length; i++) {
                                let item = linkList[i];
                                if (item.hasOwnProperty("attribs")) {
                                    if (item.attribs.class === "link" && item.attribs.service === "BitTorrent") {
                                        try {
                                            let imdb = this._imdbRegex.exec(html)[0].split('/')[2];
                                            if (this.isInLastScrapped10Movies(imdb)) {
                                                this._repositoryPages.tail = [];
                                                this._forceFinish = true;
                                            }
                                            else {
                                                this._repositoryTorrents.tail.push({ imdb, url: `https://www.cinecalidad.to${item.attribs.href}`, failed: 0 });
                                            }
                                        }
                                        catch (e) {
                                            console.log("A not valid IMDB Movie");
                                        }
                                    }
                                }
                            }
                            this._repositoryPages.done.push(url);
                            this._repositoryPages.tail.splice(0, 1);
                            this._working.scrapDetails = false;
                            this.scrapDetails();
                        }
                    });
                }
                catch (e) {
                    console.error(`Get detail fail for ${url}`);
                    this._repositoryPages.failed.push(url);
                    this._repositoryPages.tail.splice(0, 1);
                    this._working.scrapDetails = false;
                    this.scrapDetails();
                }
            }
            else {
                this.getPage(this._url + this._page);
            }
        }
    }
    static scrapTorrents() {
        if (!this._working.scrapTorrents) {
            if (this._repositoryTorrents.tail.length > 0) {
                console.log("Getting torrent " + (this._repositoryTorrents.done.length + 1));
                this._working.scrapTorrents = true;
                let torrent = this._repositoryTorrents.tail[0];
                try {
                    request.get({
                        uri: torrent.url,
                        timeout: 15000
                    }, (error, response, html) => __awaiter(this, void 0, void 0, function* () {
                        if (error) {
                            this.scrapTorrentsFailHandler(torrent);
                        }
                        else {
                            let $ = cheerio.load(html);
                            let magnet = this.magnetTransform("movie", $("#contenido #texto input")[0].attribs.value);
                            let meta = yield this.getMovieMeta(this._repositoryTorrents.tail[0].imdb);
                            // let poster = await this.getMoviePoster(this._repositoryTorrents.tail[0].imdb);
                            if (meta && magnet) {
                                let newMovie = new Movie_1.Movie({
                                    id: this._repositoryTorrents.tail[0].imdb,
                                    name: meta.name,
                                    release_date: meta.release_date || meta.released || meta.dvdRelease,
                                    runtime: meta.runtime,
                                    type: meta.type,
                                    year: meta.year,
                                    info_hash: magnet.infoHash,
                                    sources: magnet.sources,
                                    tags: magnet.tag,
                                    title: magnet.title,
                                });
                                this._movies.push(newMovie);
                            }
                            this._repositoryTorrents.done.push(torrent);
                            this._repositoryTorrents.tail.splice(0, 1);
                            this._working.scrapTorrents = false;
                            this.scrapTorrents();
                        }
                    }));
                }
                catch (e) {
                    this.scrapTorrentsFailHandler(torrent);
                }
            }
            else {
                this._movies.reverse().forEach((movie) => {
                    movie.save();
                });
                console.log("Process Done");
            }
        }
    }
    static scrapTorrentsFailHandler(torrent) {
        torrent.failed++;
        console.error(`Get torrent fail ${torrent.failed} times for ${torrent.imdb} retrying.`);
        if (torrent.failed > 9) {
            this._repositoryTorrents.tail.splice(0, 1);
            this._repositoryTorrents.failed.push(torrent);
            this._working.scrapTorrents = false;
            this.scrapTorrents();
        }
        setTimeout(() => {
            this.scrapTorrents();
        }, 5000);
    }
    static magnetTransform(type, uri) {
        const parsed = magnet.decode(uri);
        const infoHash = parsed.infoHash.toLowerCase();
        const tags = [];
        if (uri.match(/720p/i))
            tags.push("720p");
        if (uri.match(/1080p/i))
            tags.push("1080p");
        return {
            type: type,
            infoHash: infoHash,
            sources: (parsed.announce || []).map(function (x) {
                return "tracker:" + x;
            }).concat(["dht:" + infoHash]),
            tag: tags,
            title: tags[0] + " Español / English",
        };
    }
    static isInLastScrapped10Movies(imdb) {
        for (let movie of this._lastScrappedMovie) {
            if (movie.id === imdb) {
                return true;
            }
        }
        return false;
    }
    static getMovieMeta(imdb_id) {
        return new Promise(resolve => {
            this._addons.meta.get({ query: { imdb_id } }, (error, meta) => {
                if (error) {
                    resolve({});
                }
                else {
                    resolve(meta || {});
                }
            });
        });
    }
    static getMoviePoster(imdb_id) {
        return new Promise(resolve => {
            try {
                request.get({
                    uri: this._imdbMovieDetails + imdb_id,
                    timeout: 15000
                }, (error, response, html) => __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        resolve({});
                    }
                    else {
                        let $ = cheerio.load(html);
                        let name = $("div.title_wrapper h1")[0].children[0].data;
                        let year = $("span#titleYear")[0].children[1].children[0].data;
                        let txtBlocks = $("div#titleDetails .txt-block");
                        for (let key in txtBlocks) {
                            let block = txtBlocks[key];
                            console.log("");
                        }
                        let posterSrc = $("div.poster a img")[0].attribs.src;
                        let poster = posterSrc.substring(0, posterSrc.indexOf("@._V1_") + 6) + "SX300.jpg";
                        resolve({
                            poster
                        });
                    }
                }));
            }
            catch (e) {
                resolve("");
            }
        });
    }
}
Synchronizer._repositoryPages = { tail: [], done: [], failed: [] };
Synchronizer._repositoryTorrents = { tail: [], done: [], failed: [] };
Synchronizer._movies = [];
Synchronizer._working = { gettingPage: false, scrapDetails: false, scrapTorrents: false, consolidating: false };
Synchronizer._url = "https://www.cinecalidad.to/page/";
Synchronizer._imdbRegex = /imdb\.com\/title\/tt[0-9]+\//;
Synchronizer._page = 133;
Synchronizer._maxPage = Number(process.env.MAX_PAGE) || 10;
Synchronizer._forceFinish = false;
Synchronizer._cinemataEndpoint = "http://cinemeta.strem.io/stremioget/stremio/v1";
Synchronizer._imdbMovieDetails = "https://www.imdb.com/title/";
exports.Synchronizer = Synchronizer;
//# sourceMappingURL=Synchronizer.js.map
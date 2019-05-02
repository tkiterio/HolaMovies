"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const cheerio = require("cheerio");
const magnet = require("magnet-uri");
const Catalog_1 = require("./Catalog");
const cron_1 = require("cron");
class CCSynchronizer {
    static Initialize(runNow = false) {
        new cron_1.CronJob('* * 3 * * *', () => {
            this.run();
        }, null, true);
        if (runNow) {
            this.run();
        }
    }
    static run() {
        console.log("Executed");
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
                                                this._repositoryTorrents.tail.push({ imdb, url: `https://www.cinecalidad.to${item.attribs.href}` });
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
                let url = this._repositoryTorrents.tail[0].url;
                try {
                    request.get({
                        uri: url,
                        timeout: 15000
                    }, (error, response, html) => {
                        if (error) {
                            console.error(`Get torrent fail for ${url}`);
                            this._repositoryTorrents.failed.push(url);
                            this._repositoryTorrents.tail.splice(0, 1);
                            this._working.scrapTorrents = false;
                            this.scrapTorrents();
                        }
                        else {
                            let $ = cheerio.load(html);
                            this._movies.push({
                                imdb: this._repositoryTorrents.tail[0].imdb,
                                magnet: this.magnetTransform("movie", $("#contenido #texto input")[0].attribs.value)
                            });
                            this._repositoryTorrents.done.push(url);
                            this._repositoryTorrents.tail.splice(0, 1);
                            this._working.scrapTorrents = false;
                            this.scrapTorrents();
                        }
                    });
                }
                catch (e) {
                    console.error(`Get torrent fail for ${url}`);
                    this._repositoryTorrents.failed.push(url);
                    this._repositoryTorrents.tail.splice(0, 1);
                    this._working.scrapTorrents = false;
                    this.scrapTorrents();
                }
            }
            else {
                Catalog_1.Catalog.addMovies(this._movies);
                console.log("Process Done");
            }
        }
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
            title: tags[0],
        };
    }
    static isInLastScrapped10Movies(imdb) {
        for (let movie of this._lastScrappedMovie) {
            if (movie.imdb === imdb) {
                return true;
            }
        }
        return false;
    }
}
CCSynchronizer._repositoryPages = { tail: [], done: [], failed: [] };
CCSynchronizer._repositoryTorrents = { tail: [], done: [], failed: [] };
CCSynchronizer._movies = [];
CCSynchronizer._working = { gettingPage: false, scrapDetails: false, scrapTorrents: false, consolidating: false };
CCSynchronizer._url = "https://www.cinecalidad.to/page/";
CCSynchronizer._imdbRegex = /imdb\.com\/title\/tt[0-9]+\//;
CCSynchronizer._page = 1;
CCSynchronizer._maxPage = 10;
CCSynchronizer._forceFinish = false;
exports.CCSynchronizer = CCSynchronizer;
//# sourceMappingURL=CCSynchronizer.js.map
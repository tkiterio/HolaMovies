#!/usr/bin/env node

const DataProvider = require("./build/DataProvider").DataProvider;
const holaMovies = new (require("./build/HolaMovies").HolaMovies)();
const express = require('express');
const cors = require('cors');
const qs = require('querystring');
const landingTemplate = require('stremio-addon-sdk/src/landingTemplate');
const fs = require("fs");

const app = express();

app.use(cors());

// app.all('*', (req, res, next) => {
//     let log = {
//         headers: req.headers,
//         params: req.params,
//         url: req.url,
//         ip: req.headers['x-forwarded-for'] ||
//             req.connection.remoteAddress ||
//             req.socket.remoteAddress ||
//             (req.connection.socket ? req.connection.socket.remoteAddress : null)
//     };
//     DataProvider.log("REQUEST", log);
//     next();
// });

app.get('/', (req, res) => {
    res.setHeader('content-type', 'text/html');
    res.end(landingTemplate(holaMovies.getManifest()))
});

app.get("/manifest.json", (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(holaMovies.getManifest()));
});

app.get('/:resource/:type/:id/:extra?.json', async (req, res) => {
    let response = {};
    req.params.extra = req.params.extra ? qs.parse(req.params.extra) : {};
    if (req.params.resource === "catalog") {
        response = await holaMovies.catalogHandler(req.params);
    } else if (req.params.resource === "stream") {
        response = await holaMovies.streamHandler(req.params);
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(response));
});

app.get("/holamovies.png", (req, res) => {
    res.setHeader('Content-Type', 'image/png; charset=utf-8');
    res.end(fs.readFileSync("./holamovies.png"));
});

app.listen(process.env.PORT || 56641, function () {
    console.log(`http://127.0.0.1:${this.address().port}/manifest.json`);
});

require("stremio-addon-sdk").publishToCentral("https://holamovies.herokuapp.com/manifest.json");

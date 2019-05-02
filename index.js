#!/usr/bin/env node

const {serveHTTP, publishToCentral} = require("stremio-addon-sdk");
const holaMovies = new (require("./build/HolaMovies").HolaMovies)();

serveHTTP(holaMovies.getInterface(), {port: process.env.PORT || 56641});

// when you've deployed your addon, un-comment this line
// publishToCentral("https://holamovies.herokuapp.com/manifest.json")
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying.md

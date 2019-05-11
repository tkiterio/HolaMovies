#!/usr/bin/env node

const {serveHTTP, publishToCentral} = require("stremio-addon-sdk");
const holaMovies = new (require("./build/HolaMovies").HolaMovies)();

serveHTTP(holaMovies.getInterface(), {port: process.env.PORT || 56641});

publishToCentral("https://holamovies.herokuapp.com/manifest.json");

#!/usr/bin/env node

const {serveHTTP, publishToCentral} = require("stremio-addon-sdk");
const inEsUsForYou = new (require("./build/InEsUsForYou").InEsUsForYou)();

module.exports = serveHTTP(inEsUsForYou.getInterface(), {port: 56641});
// when you've deployed your addon, un-comment this line
// publishToCentral("https://my-addon.awesome/manifest.json")
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying.md

const fs = require("fs");
const merge = require("deepmerge");
const dir = "./tmp";

const manifest = require("./manifest.json");
const chrome = require("./manifest-chrome.json");
const firefox = require("./manifest-firefox.json");

const argument = process.argv.pop();

if (!["firefox", "chrome"].includes(argument)) throw Error("Specify argument");

const json =
  argument === "firefox" ? merge(manifest, firefox) : merge(manifest, chrome);

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

fs.writeFileSync(`${dir}/manifest.json`, JSON.stringify(json, null, 2));

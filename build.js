const fs = require("fs");
const merge = require("deepmerge");
const dir = "./tmp";

const manifest = require("./manifest.json");
const chromeManifest = require("./manifest-chrome.json");
const firefoxManifest = require("./manifest-firefox.json");

const argument = process.argv.pop();

let finalManifest;
if (argument === "firefox") {
  finalManifest = merge(manifest, firefoxManifest);
} else if (argument === "chrome") {
  finalManifest = merge(manifest, chromeManifest);
} else {
  throw Error("Specify argument");
}

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

fs.writeFileSync(
  `${dir}/manifest.json`,
  JSON.stringify(finalManifest, null, 2)
);

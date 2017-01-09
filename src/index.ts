import Docopt = require("docopt");
import fs = require("fs");

let loadFile = (file: string) => {
  return fs.fs.readSync(file);
};

let loadJson = (file: string) => {
  return JSON.parse(loadFile(file));
}

var doc = `
Usage:
  cloudstitch login <username>
  cloudstitch pull <user/app>
  cloudstitch serve
  cloudstitch clone <user/app> [folder]
  cloudstitch push [file]

`;

let packageJson = loadJson("../package.json");

var options = Docopt.docopt(doc, {version: packageJson.version});
for(var key in options) {
  console.log(`${key}: ${options[key]}`);
}

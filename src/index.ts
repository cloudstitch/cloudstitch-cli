import * as fs from "fs";
import * as path from "path";

import { docopt } from "docopt";

import * as utils from "./utils";

var dir = fs.readdirSync(path.join(__dirname, "./commands"))
  .map(d => d.split(".")[0])
  .filter(d => d !== "command");

var commands = {};

var doc = `
Usage:
`;

for(var ii in dir) {
  var d = dir[ii];
  commands[d] = require(path.join(__dirname, `./commands/${d}`));
  doc = `${doc}  cs ${commands[d].doc()}\n`;
}

doc = `${doc}
Options:
  -h --help     Show this screen.
  --version     Show version.
`;

var packageJson = utils.loadJson(path.join(__dirname, "../package.json"));

var options = docopt(doc, {version: packageJson.version});

Object.keys(commands).forEach(key => {
  if(typeof options[key] === "boolean" && options[key]) {
    commands[key].run(options);
  }
});

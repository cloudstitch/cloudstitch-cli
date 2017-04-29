import * as fs from "fs";
import * as path from "path";

import { docopt } from "docopt";

import * as utils from "./lib/utils";
import { instance as pkg, Package } from "./lib/package";
import { instance as logger } from "./lib/logger";
import { instance as config } from "./lib/config";
import token from "./lib/token";

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
  doc = `${doc}  ${process.title} ${commands[d].doc}\n`;
  logger.info(`found ${d}: ${commands[d].doc}`)
}

doc = `${doc}
Options:
  -h --help        Show this screen.
  -v --version     Show version.
`;

var packageJson = utils.loadJson(path.join(__dirname, "../package.json"));

var options = docopt(doc, {version: packageJson.version});

let messagePackageValidationError = (pkgValidation) => {
  if(pkgValidation.packageMalformed) {
    logger.error("Cloudstitch package defenition appears to be missing critical information or is malformed check please check your cloudstitch.json");
  } else if(pkgValidation.notFound) {
    logger.error("Cloudstitch package defenition could not be found the the current or parent directories please create a cloudstitch.json file");
  }
  process.exit(1);
};

let messageLoginError = () => {
  logger.error("You don't appear to be logged in, please run `cloudstitch login`.");
  process.exit(1);
};

Object.keys(commands).forEach(key => {
  if(typeof options[key] === "boolean" && options[key]) {
    let command = commands[key];    
    if(command.requiresPkg) {
      let thisPkgValidation = pkg.isInvalid();
      if(options["<folder>"]) {
        let folderPackage = new Package(options["<folder>"]),
            letValidation = folderPackage.isInvalid();
        if(letValidation) {
          messagePackageValidationError(letValidation);
        }
      } else if(thisPkgValidation) {
        messagePackageValidationError(thisPkgValidation);
      }
    }
    let runCommand = () => {
      commands[key].run(options);
    };
    if(command.requiresLogin) {
      token().then(runCommand, messageLoginError);
    } else {
      runCommand();
    }
    
  }
});

import * as path from "path";
import * as fs from "fs";

import * as Q from "q";
let Zip = require("jszip");

import { ICommand, ICommandOptions } from "./command";
import Request from "../lib/request";
import { instance as logger } from "../lib/logger";
import Project from "../lib/project";
import { instance as pkg } from "../lib/package";

const messageInvalidParam = () => {
  logger.error("The user and app do not appear to be valid");
  process.exit(1);
};

const messageProjectNotFound = (project: string) => {
  logger.error(`The project ${project} does not exist.`);
  process.exit(1);
};

const messageUnauthorized = (project: string) => {
  logger.error(`You do not have permission to ${project}.`);
  process.exit(1);
};

const messageError = (error: string) => {
  logger.error(`an error occured ${error}.`);
  process.exit(1);
};

class Pull implements ICommand {
  doc = "pull [<user/app>] [<folder>] [--force]";
  requiresPkg = false;
  requiresLogin = false;
  async run(options: Object) {
    let userApp = options["<user/app>"];
    let { user, app } = Project.verifyIdentifier(userApp);
    if(pkg.isInvalid() && (!user || !app)) {
      messageInvalidParam();
      return;
    }
    if(!pkg.isInvalid() && !user && !app) {
      user = pkg.get("user");
      app = pkg.get("app");
    }
    let appDir = path.join(process.cwd(), pkg.isInvalid() ? options["<folder>"] || app : "");
    let check;
    try {
      check = fs.statSync(appDir);
      logger.info(`App dir stat: ${JSON.stringify(check)}`)
    } catch(e) {} // if error happens we might be ok
    if(!check) {
      fs.mkdirSync(appDir);
    }
    logger.info(`Detected app dir: ${appDir}`);
    await Project.pull(appDir, user, app, options["--force"]);
  }
}

export =  new Pull();

import * as path from "path";
import * as fs from "fs";

import * as Q from "q";
let Zip = require("jszip");

import { ICommand, ICommandOptions } from "./command";
import Request from "../lib/request";
import { instance as logger } from "../lib/logger";
import Project from "../lib/project";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

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
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
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
    try {
      this.spinner.start();
      await Project.pull(appDir, user, app, options["--force"]);
      this.spinner.stop();
      logger.success("-- Ok --")
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }
}

export =  new Pull();

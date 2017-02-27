import * as fs from "fs";
import * as path from "path";

import * as Q from "q";

import { ICommand, ICommandOptions } from "./command";
import Project from "../lib/project"
import { instance as logger } from "../lib/logger";
import request from "../lib/request";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

class Push implements ICommand {
  doc = "push [<folder>]";
  requiresPkg = true;
  requiresLogin = true;
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
  async run(options: Object) {
    let basePath = pkg.packageRootPath || process.cwd();
    if(options["<folder>"]) {
      basePath = path.resolve(basePath, options["<folder>"]);
    }
    logger.info(`Package root directory detected: ${basePath}`);
    try {
      let result = await Project.push(basePath, pkg.get("user"), pkg.get("app"));
      this.spinner.stop();
      logger.success("-- Ok --");
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }
}

export =  new Push();

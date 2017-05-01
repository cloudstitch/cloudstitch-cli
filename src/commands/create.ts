import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import Spinner from "../lib/spinner";

class Create implements ICommand {
  doc ="create [<folder>]";
  toFolder: string;
  spinner: Spinner;

  requiresPkg(options: Object) {
    return false;
  }

  requiresLogin(options: Object) {
    return true;
  }

  invocations = ['create'];

  constructor() {
    this.spinner = new Spinner();
  }
  run(options: ICommandOptions) {
    this.toFolder = options["<folder>"];
    prompt(true).then(this.startCreate.bind(this));
  }
  startCreate(ans: Answers) {
    this.spinner.start();
    Project
     .clone(ans["title"], "project-templates/starter-widget", ans["backend"], ans["stack"])
     .then(this.startPull.bind(this))
     .catch((error) => {
       logger.error(error.message);
     });
  }
  startPull(appName: string) {
    let desination = path.resolve(process.cwd(), this.toFolder || appName);
    Project
      .pull(desination, config.get("Username"), appName, false)
      .then(() => {
        this.spinner.stop();
        logger.success(`App ${appName} createed at ${desination}`)
      }).catch((error) => {
        this.spinner.stop();
        logger.error(error.message || error);
      });
  }
}

export =  new Create();

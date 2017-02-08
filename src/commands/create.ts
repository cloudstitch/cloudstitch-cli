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
  requiresPkg = false;
  requiresLogin = true;
  toFolder: string;
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
  run(options: ICommandOptions) {
    this.toFolder = options["<folder>"];
    prompt(true).then(this.startCreate);
  }
  startCreate(ans: Answers) {
    this.spinner.start();
    Project
     .clone(ans["title"], ans["stack"], ans["backend"])
     .then(this.startPull)
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

import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import Spinner from "../lib/spinner";

import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as config } from "../lib/config";
import { instance as logger } from "../lib/logger";

class Clone implements ICommand {
  doc ="clone <user/app> [<folder>]";
  requiresPkg = false;
  requiresLogin = true;
  fromProject: string;
  toFolder: string;
  spinner: any;
  constructor() {
    this.spinner = new Spinner();
  }
  run(options: ICommandOptions) {
    this.fromProject = options["<user/app>"];
    this.toFolder = options["<folder>"];
    prompt().then(this.startClone.bind(this));
  }
  startClone(ans: Answers) {
    this.spinner.start();
    
    Project
      .clone(ans["title"], this.fromProject, ans["backend"])
      .then(this.startPull.bind(this))
      .catch((error) => {
        this.spinner.stop();
        logger.error(error.message || error);
      });
  }
  startPull(appName: string) {
    let desination = path.resolve(process.cwd(), this.toFolder || appName);
    Project
      .pull(desination, config.get("Username"), appName, false)
      .then(() => {
        this.spinner.stop();
        logger.success(`App cloned to ${desination}`)
      }).catch((error) => {
        this.spinner.stop();
        logger.error(error.message || error);
      });
  }
} 

export =  new Clone();

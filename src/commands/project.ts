import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

class ProjectCmd implements ICommand {
  doc = "project list";
  requiresPkg = false;
  requiresLogin = true; 
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
  async run(options: Object) {
    console.log(options);
    if(options['list']) {
      try {
        let user = config.get('Username');

        if (!user) {
          this.spinner.stop();
          logger.error("No username found.");
          return;
        }

        let result = await Project.list(user);
        this.spinner.stop();
        logger.success("-- Ok --");
      } catch(e) {
        this.spinner.stop();
        logger.error(e);
      }
    } else {
      console.log("OTHER!");
    }
  }
}

export = new ProjectCmd();
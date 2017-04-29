import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

const MODULES = {
  notification: true
}

class Add implements ICommand {
  doc = "add <aspect> --jsonfile=somefile";
  requiresPkg = true;
  requiresLogin = true;
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
  async run(options: Object) {
    try {
      console.log(options);
      if (! options["--jsonfile"]) {
        console.log(options);
        usage();
      } else {
        let aspect = options['<aspect>'];
        if (MODULES[aspect]) {
          let user = pkg.get('user');
          let app = pkg.get('app');
          let result = await Project.addObject(user, app, aspect, options["--jsonfile"]);
        } else {
          logger.error("We didn't understand that.")
        }
      }
      this.spinner.stop();
      logger.success("-- Ok --");
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }
}

export = new Add();
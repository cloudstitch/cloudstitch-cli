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

class Remove implements ICommand {
  doc = "remove <aspect> <id>";
  requiresPkg = true;
  requiresLogin = true;
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
  async run(options: Object) {
    try {
      let aspect = options['<aspect>'];
      let id = options['<id>'];
      if (id && MODULES[aspect]) {
        let user = pkg.get('user');
        let app = pkg.get('app');
        let result = await Project.removeObject(user, app, aspect, id);
      } else {
        logger.error("We didn't understand that.")
      }
      this.spinner.stop();
      logger.success("-- Ok --");
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }
}

export = new Remove();
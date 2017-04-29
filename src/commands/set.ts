import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

function usage() {
  logger.info(`Usage:\n - ${process.title} set settings publish <jsonfile> \n - ${process.title} set settings api <jsonfile>\n`)
}

const MODULES = {
  api: true,
  publish: true,
  sync: true,
  deploy: true
}

class SetSettings implements ICommand {
  doc = "set settings <aspect> --jsonfile=somefile";
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
        if (options['settings'] && (MODULES[aspect])) {
          let user = pkg.get('user');
          let app = pkg.get('app');
          let result = await Project.setSettings(user, app, aspect, options["--jsonfile"]);
        } else {
          usage();
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

export = new SetSettings();
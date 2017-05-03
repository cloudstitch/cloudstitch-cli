import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

const WHICH_SETTINGS = "<api|publish|sync|deploy|folder>";
const WHICH_OP = "<get|set>";
const JSON_FILE = "[--jsonfile]";

class Settings implements ICommand {
  doc = "settings (<api> | <sync> | <folder>) (<get> | <set>) [--jsonfile=<somefile>]";
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }

  requiresPkg(options: Object) {
    return true;
  }

  requiresLogin(options: Object) {
    return true;
  }

  invocations = ['settings'];

  usage() {
    logger.info(`Usage: ${this.doc}`);
  }

  async run(options: Object) {
    try {
      var whichSettings = options["<api>"] || options["<publish>"] || options["<sync>"] || options["<deploy>"] || options["<folder>"];
      var whichOperation = options["<get>"] || options["<set>"];
      var jsonFile = options['--jsonfile'];

      if ((!whichSettings) || (!whichOperation)) {
        this.usage();
        this.spinner.stop();
        return;
      }

      let user = pkg.get('user');
      let app = pkg.get('app');
      let result;

      if (whichOperation == 'get') {
        result = await Project.getSettings(user, app, whichSettings);
      } else if (whichOperation == 'set') {
        result = await Project.setSettings(user, app, whichSettings, jsonFile);
      }

      this.spinner.stop();
      logger.success("-- Ok --");
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }
}

export = new Settings();
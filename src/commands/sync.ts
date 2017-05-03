import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

class Sync implements ICommand {
  doc = "sync (<local> | <staging> | <production>)";
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

  invocations = ['sync'];

  async run(options: Object) {
    try {
      var destination = options["<local|staging|production>"];
      switch(destination) {
        case 'local':
          logger.success("sync local!")
          break;
        case 'production':
          logger.success("sync prod!")
          break;
        case 'staging':
          logger.success("sync staging!")
          break;
      }
      this.spinner.stop();
      logger.success("-- Ok --");
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }
}

export = new Sync();
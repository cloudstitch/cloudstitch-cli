import * as path from "path";

import { Answers } from "inquirer";
import * as inquirer from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

const SUBCOMMANDS = "<list|delete>";

class ProjectCmd implements ICommand {
  doc = "project (<list>|<delete>)";
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }

  requiresPkg(options: Object) {
    return false;
  }

  requiresLogin(options: Object) {
    return true;
  }

  invocations = ['project'];

  async run(options: Object) {
    try {
      var destination = options["<list>"] || options["<delete>"];
      switch(destination) {
        case 'list':
          await this.list(options);
          break;
        case 'delete':
          await this.remove(options);
          break;
        default:
          logger.error("Please specify either `project list` or `project delete`")
          break;
      }
      this.spinner.stop();
      logger.success("-- Ok --");
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }

  async list(options: Object) {
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
  }

  async remove(options: Object) {
    var self = this;
    inquirer.prompt([
      {
        type:"input",
        message: "Type the full project name to delete",
        name: "projectName"
      }
    ]).then(function(a) {self.reallyRemove(a)});
  }

  async reallyRemove(answers: inquirer.Answers) {
    var providedName = answers['projectName'];
    let user = pkg.get('user');
    let app = pkg.get('app');
    if (providedName != app) {
      this.spinner.stop();
      logger.success("Delete canceled - names do not match.");
      return;      
    } 
    let result = await Project.delete(user, app);
    this.spinner.stop();
    logger.success("Project deleted remotely.");
  }

}

export = new ProjectCmd();
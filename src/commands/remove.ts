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
import {MultiplexingCommand} from "../lib/multiplexing_command";

const SUBCOMMANDS = "<list|delete>";

class RemoveCmd extends MultiplexingCommand implements ICommand {
  doc = "remove <target> [--id=<id>]";
  invocations = ['remove'];

  multiplexedCommands() {
    return [
      {name: 'project', package: true, login: true},
      {name: 'notification', package: true, login: true}
    ]
  }

  constructor() {
    super()
  }

  async project(options: Object) {
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
    if (providedName != this.packageApp) {
      this.spinner.stop();
      logger.success("Delete canceled - names do not match.");
      return;      
    } 
    await Project.delete(this.packageUser, this.packageApp);
    logger.success("Project deleted remotely.");
  }

  async notification(options: Object) {
    await Project.removeObject(this.packageUser, this.packageApp, 'notifications', options["<id>"]);
  }
  
}

export = new RemoveCmd();
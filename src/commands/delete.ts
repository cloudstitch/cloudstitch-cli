import * as fs from "fs";
import * as path from "path";

import * as Q from "q";
import * as inquirer from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import Project from "../lib/project"
import { instance as logger } from "../lib/logger";
import request from "../lib/request";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

class Delete implements ICommand {
  doc = "delete";
  requiresPkg = true;
  requiresLogin = true;
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
  async run(options: Object) {
    var self = this;
    inquirer.prompt([
      {
        type:"input",
        message: "Type the full project name to delete",
        name: "projectName"
      }
    ]).then(function(a) {self.runDelete(a)});
  }
  async runDelete(answers: inquirer.Answers) {
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

export =  new Delete();

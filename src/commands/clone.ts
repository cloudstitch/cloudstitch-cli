import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as config } from "../lib/config";
import { instance as logger } from "../lib/logger";

class Clone implements ICommand {
  doc ="clone <user/app> [<folder>]";
  requiresPkg = false;
  requiresLogin = false;
  toProject: string;
  toFolder: string;
  run(options: ICommandOptions) {
    this.toProject = options["<user/app>"];
    this.toFolder = options["<folder>"];
    prompt().then(this.startClone);
  }
  startClone(ans: Answers) {
    Project
      .clone(ans["title"], this.toProject, ans["backend"])
      .then(this.startPull);
  }
  startPull(appName: string) {
    let desination = path.resolve(process.cwd(), this.toFolder || appName);
    Project
      .pull(desination, config.get("Username"), appName)
      .then(() => logger.success(`App cloned to {desination}`));
  }
} 

export =  new Clone();

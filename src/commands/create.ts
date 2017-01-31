import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";

class Clone implements ICommand {
  doc ="create [<folder>]";
  requiresPkg = false;
  requiresLogin = false;
  run(options: Object) {
    prompt(true).then(this.startCreate);
  }
  startCreate(ans: Answers) {
    Project
     .clone(ans["title"], ans["stack"], ans["backend"])
     .then(this.startPull);
  }
  startPull(appName: string) {

  }
}

export =  new Clone();

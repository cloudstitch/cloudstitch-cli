import * as fs from "fs";
import * as path from "path";

import * as Q from "q";

import { ICommand, ICommandOptions } from "./command";
import Project from "../lib/project"
import { instance as logger } from "../lib/logger";

class Push implements ICommand {
  doc = "push [<folder>]";
  requiresPkg = true;
  requiresLogin = true;
  async run(options: Object) {
    let basePath = process.cwd();
    if(options["<folder>"]) {
      basePath = path.resolve(basePath, options["<folder>"]);
    }
    logger.info(`Package root directory detected: ${basePath}`);
    let zip: Buffer = <Buffer> await Project.zip(basePath);
    await Q.nfcall(fs.writeFile, "test.zip", zip);
  }
}

export =  new Push();

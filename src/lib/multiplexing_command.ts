import * as path from "path";

import { Answers } from "inquirer";
import * as inquirer from "inquirer";

import { ICommand, ICommandOptions } from "../commands/command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";

export interface MultiplexedCommand {
  name: string;
  package: boolean;
  login: boolean;    
}

export class MultiplexingCommand {
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }

  invocations = ['list'];
  packageUser = null;
  packageApp = null;
  cliUser = null;
  didRequirePkg = false;
  didRequireLogin = false;
  
  multiplexedCommands() : MultiplexedCommand[] {
    return []
  }

  requiresPkg(options: Object) {
    let cmds = this.multiplexedCommands();
    for (var cmd of cmds) {
      if (options[`<target>`] == cmd.name) {
        this.didRequirePkg = cmd.package;
        this.didRequirePkg;
      }
    }
    return false;
  }

  requiresLogin(options: Object) {
    for (var cmd of this.multiplexedCommands()) {
      if (options[`<target>`] == cmd.name) {
        this.didRequireLogin = cmd.login;
        this.didRequireLogin;
      }
    }
    return false;
  }

  async run(options: Object) {
    if (this.didRequireLogin) {
      try {
        this.cliUser = config.get('Username');
      } catch(ex) {
        logger.error("Couldn't get username");
      }
      if (!this.cliUser) {
        this.spinner.stop();
        logger.error("No username found.");
        return;        
      }
    }

    if (this.didRequirePkg) {
      console.log("did require package");
      try {
        this.packageUser = pkg.get('user');
      } catch(ex) {
        console.log("Couldn't get package",ex);
      }

      try {
        this.packageApp = pkg.get('app');
      } catch(ex) {
        console.log("Couldn't get app",ex);
      }

      if ((!this.packageApp) || (!this.packageUser)) {
        this.spinner.stop();
        logger.error("Could not find package user/app.");
        return;        
      }
    }

    try {    
      var directObject = null;
      for (var cmd of this.multiplexedCommands()) {
        directObject = directObject || options[`<target>`];
      }
      if (typeof this[directObject] != 'undefined') {
        try {
          await this[directObject](options);
        } catch(e) {
          logger.error("We encountered an exception while running your command.");
          logger.error(e);
        }
      } else {
        logger.error("Unknown subcommand");
      }
      this.spinner.stop();
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }

}


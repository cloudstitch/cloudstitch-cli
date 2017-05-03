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
let opn = require("opn");

const SUBCOMMANDS = "<list|delete>";

const ERROR_MSG = "Unknown thing to get"

class OauthCmd extends MultiplexingCommand implements ICommand {
  doc = "oauth (<github>|<gitlab>|<stripe>) [--unlink]";
  invocations = ['oauth'];

  multiplexedCommands() {
    return [
      {name: 'github', package: false, login: true},
      {name: 'gitlab', package: false, login: true},
      {name: 'stripe', package: false, login: true}
    ]
  }

  constructor() {
    super()
  }

  async github(options: Object) {
    if (options["--unlink"]) {
      this.doUnlink('github');
    } else {
      this.doLink('github');
    }
  }

  async stripe(options: Object) {
    if (options["--unlink"]) {
      this.doUnlink('stripe');
    } else {
      this.doLink('stripe');
    }
  }

  async gitlab(options: Object) {
    if (options["--unlink"]) {
      this.doUnlink('gitlab');
    } else {
      this.doLink('gitlab');
    }
  }

  doUnlink(svc:string) {
    opn(`https://www.cloudstitch.com/auth/${svc}/unlink`);
  }

  doLink(svc:string) {
    opn(`https://www.cloudstitch.com/auth/${svc}`);
  }


}

export = new OauthCmd();
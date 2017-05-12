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

class ListCmd extends MultiplexingCommand implements ICommand {
  doc = "list <target>";
  invocations = ['list'];
  multiplexedCommands() {
    return [
      {name: 'projects', package: false, login: true},
      {name: 'notifications', package: false, login: true}
    ]
  }

  constructor() {
    super()
  }

  async projects(options: Object) {
    await Project.list(this.cliUser);
  }

  async notifications(options: Object) {
    logger.error("Unimplemented");
  }

}

export = new ListCmd();
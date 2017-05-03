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

class AppCmd extends MultiplexingCommand implements ICommand {
  doc = "add (<api>|<publish>|<folder>|<notification>)";
  invocations = ['add'];

  multiplexedCommands() {
    return [
      {name: 'notification', package: true, login: true}
    ]
  }

  constructor() {
    super()
  }

  async notification(options: Object) {
    logger.error("Unimplemented");
  }

}

export = new AppCmd();
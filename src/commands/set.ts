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

const ERROR_MSG = "Unknown thing to get"

class SetCmd extends MultiplexingCommand implements ICommand {
  doc = "set <target> <subtarget> [--jsonfile=<somefile>]";
  invocations = ['set'];

  multiplexedCommands() {
    return [
      {name: 'api', package: true, login: true},
      {name: 'publish', package: true, login: true},
      {name: 'folder', package: true, login: true},
      {name: 'notification', package: true, login: true}
    ]
  }

  constructor() {
    super()
  }

  async api(options: Object) {
    if (options["<subtarget>"] == 'settings') {
      await Project.setSettings(this.packageUser, this.packageApp, 'api', options["--jsonfile"]);
    } else {
      logger.error(ERROR_MSG);
    }
  }

  async publish(options: Object) {
    if (options["<subtarget>"] == 'settings') {
      await Project.setSettings(this.packageUser, this.packageApp, 'publish', options["--jsonfile"]);
    } else {
      logger.error(ERROR_MSG);
    }
  }

  async folder(options: Object) {
    if (options["<subtarget>"] == 'settings') {
      await Project.setSettings(this.packageUser, this.packageApp, 'folder', options["--jsonfile"]);
    } else {
      logger.error(ERROR_MSG);
    }
  }

  async notification(options: Object) {
    if (options["<subtarget>"] == 'settings') {
      await Project.setSettings(this.packageUser, this.packageApp, 'notification', options["--jsonfile"]);
    } else {
      logger.error(ERROR_MSG);
    }
  }

}

export = new SetCmd();
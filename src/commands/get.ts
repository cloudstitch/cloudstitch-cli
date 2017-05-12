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

class GetCmd extends MultiplexingCommand implements ICommand {
  doc = "get <target> <subtarget> [--url=<url>] [--jsonfile=<jsonfile>]";
  invocations = ['get'];

  multiplexedCommands() {
    return [
      {name: 'api', package: true, login: true},
      {name: 'publish', package: true, login: true},
      {name: 'folder', package: true, login: true},
      {name: 'project', package: true, login: true},
      {name: 'notification', package: true, login: true}
    ]
  }

  constructor() {
    super()
  }

  async api(options: Object) {
    if (options["<subtarget>"] == 'settings') {
      var settingsJson = await Project.getSettings(this.packageUser, this.packageApp, 'api');
      logger.info(`\n\n ${JSON.stringify(settingsJson, undefined, 2)}\n\n`);
    } else {
      logger.error(ERROR_MSG);
    }
  }

  async publish(options: Object) {
    console.log(options);
    if (options["<subtarget>"] == 'settings') {
      var settingsJson = await Project.getSettings(this.packageUser, this.packageApp, 'publish');
      logger.info(`\n\n ${JSON.stringify(settingsJson, undefined, 2)}\n\n`);
    } else {
      logger.error(ERROR_MSG);
    }
  }

  async folder(options: Object) {
    if (options["<subtarget>"] == 'settings') {
      var settingsJson = await Project.getSettings(this.packageUser, this.packageApp, 'folder');
      logger.info(`\n\n ${JSON.stringify(settingsJson, undefined, 2)}\n\n`);
    } else {
      logger.error(ERROR_MSG);
    }
  }

  async project(options: Object) {
    console.log('project', options['<project>'], options);
    if (options["<subtarget>"] == 'info') {
      var settingsJson = await Project.getInfo(this.packageUser, this.packageApp, options["--url"], options["--jsonfile"]);
      logger.info(`\n\n ${JSON.stringify(settingsJson, undefined, 2)}\n\n`);
    } else {
      logger.error(ERROR_MSG);
    }
  }

  async notification(options: Object) {
    if (options["<subtarget>"] == 'settings') {
      var settingsJson = await Project.getSettings(this.packageUser, this.packageApp, 'notification');
      logger.info(`\n\n ${JSON.stringify(settingsJson, undefined, 2)}\n\n`);
    } else {
      logger.error(ERROR_MSG);
    }
  }

}

export = new GetCmd();
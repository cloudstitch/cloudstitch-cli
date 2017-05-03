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

class OpenCmd extends MultiplexingCommand implements ICommand {
  doc = "open (<project>|<folder>|<sheet>)";
  invocations = ['open'];

  multiplexedCommands() {
    return [
      {name: 'project', package: true, login: true},
      {name: 'folder', package: true, login: true},
      {name: 'sheet', package: true, login: true}
    ]
  }

  constructor() {
    super()
  }

  async project(options: Object) {
    opn(`https://cloudstitch.com/${this.packageUser}/${this.packageApp}/edit`)
  }

  async folder(options: Object) {
    var folderSettings = await Project.getSettings(this.packageUser, this.packageApp, 'folder');

    if (!folderSettings) {
      logger.error("Couldn't find folder settings");
      return;
    }

    if ((folderSettings['linkedProjectFolderService'] != 'google') && (folderSettings['linkedProjectFolderService'] != 'microsoft')) {
      logger.error(`Unsupported folder service: ${folderSettings['linkedProjectFolderService']}`);
      return;      
    }

    if ((folderSettings['linkedProjectFolderService'] == 'microsoft') && folderSettings['linkedProjectFolderPath']) {
      opn(`https://cloudstitch-my.sharepoint.com/personal/services_cloudstitch_onmicrosoft_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fservices_cloudstitch_onmicrosoft_com%2FDocuments%2F${encodeURIComponent(folderSettings['linkedProjectFolderPath'])}`);
    } else if ((folderSettings['linkedProjectFolderService'] == 'google') && folderSettings['linkedProjectFolderKey'])  {
      opn(`https://drive.google.com/drive/folders/${encodeURIComponent(folderSettings['linkedProjectFolderKey'])}`);
    } else {
      logger.error("Could not find an openable folder link.");
    }
  }

  async sheet(options: Object) {
    logger.error("Unimplemented");    
  }

}

export = new OpenCmd();
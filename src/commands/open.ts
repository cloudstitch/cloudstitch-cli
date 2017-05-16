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
  doc = "open <target>";
  invocations = ['open'];

  multiplexedCommands() {
    return [
      {name: 'project', package: true, login: true},
      {name: 'folder', package: true, login: true},
      {name: 'repo', package: true, login: true},
      {name: 'sheet', package: true, login: true}
    ]
  }

  constructor() {
    super()
  }

  async project(options: Object) {
    let url = `https://cloudstitch.com/${this.packageUser}/${this.packageApp}/edit`;
    console.log(url);
    opn(url, {wait: false})
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
      opn(`https://cloudstitch-my.sharepoint.com/personal/services_cloudstitch_onmicrosoft_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fservices_cloudstitch_onmicrosoft_com%2FDocuments%2F${encodeURIComponent(folderSettings['linkedProjectFolderPath'])}`,  {wait: false});
    } else if ((folderSettings['linkedProjectFolderService'] == 'google') && folderSettings['linkedProjectFolderKey'])  {
      opn(`https://drive.google.com/drive/folders/${encodeURIComponent(folderSettings['linkedProjectFolderKey'])}`, {wait: false});
    } else {
      logger.error("Could not find an openable folder link.");
    }
  }

  async sheet(options: Object) {
    var info = await Project.getInfo(this.packageUser, this.packageApp);
    if (info.apiSpreadsheetService == 'google') {
      if (info.apiSpreadsheetKey) {
        opn(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(info['apiSpreadsheetKey'])}`, {wait: false});
        return;
      }
    } else if (info.apiSpreadsheetService == 'microsoft') {
      if (info.apiSpreadsheetKey) {
        opn(`https://cloudstitch-my.sharepoint.com/personal/services_cloudstitch_onmicrosoft_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fservices_cloudstitch_onmicrosoft_com%2FDocuments%2F${encodeURIComponent(info['apiSpreadsheetKey'])}`, {wait: false});
        return;
      }
    }
    logger.error("Unable to open your project's API Spreadsheet. Please type 'cloudstitch open project' and try the web interface.");
  }

  async repo(options: Object) {
    var info = await Project.getInfo(this.packageUser, this.packageApp);

    if (info.gitLink) {
      if (info.gitLink.service && info.gitLink.user && info.gitLink.repo) {
        if (info.gitLink.service == 'github') {
          opn(`https://github.com/${encodeURIComponent(info.gitLink.user)}/${encodeURIComponent(info.gitLink.repo)}`, {wait: false});
          return;
        } else if (info.gitLink.service == 'gitlab') {
          opn(`https://gitlab.com/${encodeURIComponent(info.gitLink.user)}/${encodeURIComponent(info.gitLink.repo)}`, {wait: false});
          return;
        }
      }
    }
    logger.error("Unable to open your project's repository. Please type 'cloudstitch open project' and try the web interface.");
  }
}

export = new OpenCmd();
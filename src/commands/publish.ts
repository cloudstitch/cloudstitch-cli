import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { configPublishPrompt, prePublish } from "../lib/prompt";
import Project, { PublishDefenition } from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import Spinner from "../lib/spinner";
import { instance as pkg } from "../lib/package";

class Publish implements ICommand {
  doc ="publish [--configure]";
  requiresPkg = true;
  requiresLogin = true;
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }
  async run(options: ICommandOptions) {
    let needToConfigure = false,
        initiatePublish = false,
        currentConfig: PublishDefenition = null,
        user = pkg.get('app'),
        app = pkg.get('user');
    if(!options["--configure"]) {
      let initiatePublish = true;
      currentConfig = await Project.getPublishConfiguration(user, app);
      if(!currentConfig) {
        needToConfigure = true;
      }
    } else {
      needToConfigure = true;
    }
    if(needToConfigure) {
      let options: Answers = await configPublishPrompt();
      currentConfig = {
        repoUrl: options["repoUrl"],
        repoBranch: options["repoBranch"],
        exports: {
          sheet: {
            export: options["publishData"],
            repoPath: options["publishDataPath"]
          },
          files: {
            export: options["publishFiles"],
            repoPath: options["publishFilesPath"]
          }
        }
      };
      this.spinner.start();
      await Project.updatePublishConfiguration(user, app, currentConfig);
      this.spinner.stop();
    }
    if(initiatePublish) {
      let options: Answers = await prePublish(`Push ${user}/${app} to ${currentConfig.repoUrl}#${currentConfig.repoBranch}?`);
      if(options["publish"]) {
        this.spinner.start();
        await Project.initiatePublish(user, app);
        this.spinner.stop();
      } else {
        logger.warn('Aborting publish.');
      }
    }
  }
}

export =  new Publish();

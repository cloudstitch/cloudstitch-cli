import * as path from "path";

import { Answers } from "inquirer";
let opn = require("opn");

import { ICommand, ICommandOptions } from "./command";
import { configPublishPrompt, prePublish } from "../lib/prompt";
import Project, { PublishDefenition, checkAuthToken } from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import Spinner from "../lib/spinner";
import { instance as pkg } from "../lib/package";

class Publish implements ICommand {
  doc ="publish [--configure]";
  spinner: Spinner;
  constructor() {
    this.spinner = new Spinner();
  }

  requiresPkg(options: Object) {
    return true;
  }

  requiresLogin(options: Object) {
    return true;
  }

  invocations = ['publish'];

  async run(options: ICommandOptions) {
    let needToConfigure = false,
        initiatePublish = false,
        currentConfig: PublishDefenition = null,
        app = pkg.get('app'),
        user = pkg.get('user');
    let needAuth = !await checkAuthToken("github");
    if(needAuth) {
      logger.warn("You need to authorize cloudstitch before you can continue. Visit https://cloudstitch.com/auth/github");
      opn("https://cloudstitch.com/auth/github");
      process.exit(1);
    }
    if(!options["--configure"]) {
      logger.info("Cehcking on config stored in backend");
      initiatePublish = true;
      currentConfig = await Project.getPublishConfiguration(user, app);
      needToConfigure = currentConfig == null;
    } else {
      needToConfigure = true;
    }
    if(needToConfigure) {
      let options: Answers = await configPublishPrompt();
      currentConfig = {
        repoUrl: options["repoUrl"],
        repoBranch: options["repoBranch"]
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

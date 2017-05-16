import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { gitprompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import Spinner from "../lib/spinner";
import fs = require("fs");
import requestHttp = require("request");
import { instance as pkg } from "../lib/package";
var parse = require('parse-git-config');

class Create implements ICommand {
  doc ="create [<folder>] [--url=<url>] [--template=<template>]";
  toFolder: string;
  spinner: Spinner;
  fromProject: string;

  requiresPkg(options: Object) {
    return false;
  }

  requiresLogin(options: Object) {
    return true;
  }

  invocations = ['create'];

  constructor() {
    this.spinner = new Spinner();
  }
  run(options: ICommandOptions) {
    this.toFolder = options["<folder>"];
    var self = this;

    if (pkg.get('user') || pkg.get('app')) {
      
    }

    let template = pkg.get('template');
    let currentGitRepo = getCurrentGitRepo();
    let localSettingsFound = false;
    if (template) localSettingsFound = true;
    let proposedGitRepo = undefined;
    if (template && template['gitRepo']) proposedGitRepo = template['gitRepo'];

    gitprompt(localSettingsFound, currentGitRepo, proposedGitRepo).then((ans) => {
      if (ans['localSettings']) {
        console.log("Locl settings");
      }

      if (ans['fork']) {
        console.log("Do fork");
      }

     let projUrl = undefined;
      if (options["<url>"]) {
        projUrl = options["<url>"];
      }

     let inlineJson = undefined;
     if (options["<template>"]) {
       try {
         let jsonFile = fs.readFileSync(options["<template>"]).toString();
         inlineJson = JSON.parse(jsonFile);
       } catch(ex) {
         logger.error("Could not read settings file");
       }   
     }

     let useGitRepo = undefined;
     if (currentGitRepo && ans['useGit']) {
      useGitRepo = currentGitRepo;
     }

     let cloneGitRepo = undefined;
     if (proposedGitRepo && ans['fork']) {
       cloneGitRepo = proposedGitRepo;
     }

     let reqw = Project.siteCloneRequest(ans['title'], ans['backend'], inlineJson, projUrl, cloneGitRepo, useGitRepo);

      Project
      .clone(reqw)
      .then((appName) => {
        let desination = path.resolve(process.cwd(), this.toFolder || appName);
        Project
          .pull(desination, config.get("Username"), appName, false)
          .then(() => {
            this.spinner.stop();
            logger.success(`App ${appName} createed at ${desination}`)
          })
      })
    })
    .catch((error) => {
      logger.error(error.message);
    });

  }
}

function getCurrentGitRepo() : string {
  try {
    var config = parse.sync();
    if (config && config[`'remote "origin"`] && config[`'remote "origin"`]['url']) {
      return config[`'remote "origin"`]['url'];
    }
  } catch(ex) {
    console.log(ex);
    return null;
  }
  return null;
}

export =  new Create();

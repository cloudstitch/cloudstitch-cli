import * as path from "path";

import { Answers } from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import { prompt } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import Spinner from "../lib/spinner";
import fs = require("fs");
import requestHttp = require("request");

class Create implements ICommand {
  doc ="create [<folder>] [--url=<url>] [--jsonfile=<filename>]";
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

    if (options["<url>"]) {
      this.getUrlAndStart(options);
    } else if (options["<jsonfile>"]) {
      this.getFileFromOptsAndStart(options);
    } else if (options["<clone>"]) {
      this.fromProject = options["<clone>"];
      this.toFolder = options["<folder>"];
      prompt().then(this.startClone.bind(this));
    } else {
      prompt(true).then(this.startCreate.bind(this));
    }
  }

  getUrlAndStart(options: ICommandOptions) {
    var self = this;
    var httpOptions = {
      url: options["<url>"],
      method: 'GET',
      json:true
    }
    requestHttp(httpOptions, function(error, response, body){
      if(error) {
        logger.error("Unable to download project defined at URL: " + options["<url>"]);
      } else {
        if (typeof body == 'string') {
          try {
            let json = JSON.parse(body);
            self.startCreateWithJson(body, options);            
          } catch(ex) {
            logger.error("Could not parse settings file");
          }
        } else {
          self.startCreateWithJson(body, options);
        }
      }
    });
  }

  getFileFromOptsAndStart(options: ICommandOptions) {
    this.getFileAndStart(options["<filename>"], options);
  }

  getFileAndStart(filename: string, options: ICommandOptions) {
    try {
      let jsonFile = fs.readFileSync(filename).toString();
      let json = JSON.parse(jsonFile);
      this.startCreateWithJson(json, options);
    } catch(ex) {
      logger.error("Could not read settings file");
    }   
  }

  startCreateWithJson(json: any, options: ICommandOptions) {
    console.log("Going to start with options", JSON.stringify(json, undefined, 2));
  }

  startCreate(ans: Answers) {
    this.spinner.start();
    Project
     .clone(ans["title"], "project-templates/starter-widget", ans["backend"], ans["stack"])
     .then(this.startPull.bind(this))
     .catch((error) => {
       logger.error(error.message);
     });
  }

  startClone(ans: Answers) {
    this.spinner.start();
    Project
      .clone(ans["title"], this.fromProject, ans["backend"])
      .then(this.startPull.bind(this))
      .catch((error) => {
        this.spinner.stop();
        logger.error(error.body || error.message || error);
      });
  }

  startPull(appName: string) {
    let desination = path.resolve(process.cwd(), this.toFolder || appName);
    Project
      .pull(desination, config.get("Username"), appName, false)
      .then(() => {
        this.spinner.stop();
        logger.success(`App ${appName} createed at ${desination}`)
      }).catch((error) => {
        this.spinner.stop();
        logger.error(error.message || error);
      });
  }
}

export =  new Create();

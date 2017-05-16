import * as fs from "fs";
import * as path from "path";
import * as Q from "q";
var chalk = require("chalk");

import { Answers } from "inquirer";
import Server from "../lib/server";
import { ICommand, ICommandOptions } from "./command";
import { prompt, promptUse } from "../lib/prompt";
import Project from "../lib/project";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import { Package, instance as pkg } from "../lib/package";
import Spinner from "../lib/spinner";
import request from "../lib/request";
import {MultiplexingCommand} from "../lib/multiplexing_command";

let Zip = require("jszip");

const messageInvalidParam = () => {
  logger.error("The user and app do not appear to be valid");
  process.exit(1);
};

const messageProjectNotFound = (project: string) => {
  logger.error(`The project ${project} does not exist.`);
  process.exit(1);
};

const messageUnauthorized = (project: string) => {
  logger.error(`You do not have permission to ${project}.`);
  process.exit(1);
};

const messageError = (error: string) => {
  logger.error(`an error occured ${error}.`);
  process.exit(1);
};

class Widget extends MultiplexingCommand implements ICommand {
  doc = "widget <target> <subtarget> [<user/app>] [<toFolder>] [--status]";
  invocations = ['widget'];
  package: any;

  multiplexedCommands() {
    return [
      {name: 'pull', package: true, login: false},
      {name: 'push', package: true, login: true},
      {name: 'sync', package: true, login: true},
      {name: 'publish', package: true, login: true},
      {name: 'clone', package: false, login: true},
      {name: 'serve', package: true, login: false},
      {name: 'create', package: false, login: true}
    ]
  }

  constructor() {
    super()
  }

  async serve(options: Object) {
    let server = new Server(!!options["--watch"],  options["<folder>"]);
    server.run();
  }

  async sync(options: Object) {
    if (options['--status']) {
      let result = await Project.getTaskStatus(pkg.get("user"), pkg.get("app"), 'datasource', 'sheet', 'update-cache', 'gsheet');
    } else {
      let result = await Project.initiatePublishSheet(pkg.get("user"), pkg.get("app"));
    }
  }

  async clone(options: Object) {
    let fromProject = options["<user/app>"];
    let toFolder = options["<folder>"];

    prompt().then((ans) => {
      let cloneReq = Project.widgetCloneRequest(ans["title"], fromProject, ans["backend"]);
      Project
        .clone(cloneReq)
        .then((appName) => {
          let desination = path.resolve(process.cwd(), toFolder || appName);
          Project
            .pull(desination, config.get("Username"), appName, false)
            .then(() => {
              logger.success(`App ${appName} createed at ${desination}`)
            }).catch((error) => {
              logger.error(error.message || error);
            });
        })
    })
    .catch((error) => {
      this.spinner.stop();
      logger.error(error.body || error.message || error);
    });
  }

  async create(options: Object) {
    let toFolder = options["<folder>"];
    prompt(true).then((ans) => {
      let cloneReq = Project.widgetCloneRequest(ans["title"], "project-templates/starter-widget", ans["backend"], ans["stack"]);
      Project
      .clone(cloneReq)
      .then((appName) => {
        let desination = path.resolve(process.cwd(), toFolder || appName);
        Project
          .pull(desination, config.get("Username"), appName, false)
          .then(() => {
            this.spinner.stop();
            logger.success(`App ${appName} createed at ${desination}`)
          }).catch((error) => {
            this.spinner.stop();
            logger.error(error.message || error);
          });
      })
    })
    .catch((error) => {
      logger.error(error.message);
    });
  }

  async push(options: Object) {
    let basePath = pkg.packageRootPath || process.cwd();
    if(options["<folder>"]) {
      basePath = path.resolve(basePath, options["<folder>"]);
    }
    logger.info(`Package root directory detected: ${basePath}`);
    try {
      let result = await Project.push(basePath, pkg.get("user"), pkg.get("app"));
    } catch(e) {
      logger.error(e);
    }
  }
  
  async pull(options: Object) {
    //   doc = "pull [<user/app>] [<folder>] [--force]";
    let userApp = options["<user/app>"];
    let { user, app } = Project.verifyIdentifier(userApp);
    if(!userApp && pkg.isInvalid()) {
      return logger.usage("Usage: pull user/app");
    }
    if(pkg.isInvalid() && (!user || !app)) {
      messageInvalidParam();
      return;
    }
    if(!pkg.isInvalid() && !user && !app) {
      user = pkg.get("user");
      app = pkg.get("app");
    }
    let appDir = path.join(process.cwd(), pkg.isInvalid() ? options["<folder>"] || app : "");
    try {
      this.spinner.start();
      await Project.pull(appDir, user, app, options["--force"]);
      this.spinner.stop();
      logger.success("-- Ok --")
    } catch(e) {
      this.spinner.stop();
      logger.error(e);
    }
  }

  async publish(options: Object) {
    this.package = pkg.isInvalid() ? new Package(path.join(process.cwd(), options["<folder>"])) : pkg;
    promptUse().then(this.provideHelp.bind(this));
  }

  provideHelp(ans: Answers) {  
    var user = this.package.get('user');
    var app = this.package.get('app');
    var variant = this.package.get('variant');
    switch (ans['environment']) {
      case 'html':
        console.log(`
${chalk.green.bold('To place this widget on a web page:')}

${chalk.green('1) Paste the following code into the <HEAD> element:')}

<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.13/webcomponents-lite.min.js"></script>
<link rel="import" href="https://components.cloudstitch.com/cloudstitch-${variant}.html" />

${chalk.green('2) Paste the following code where the widget should appear:')}

<cloudstitch-${variant} user="${user}" app="${app}"></cloudstitch-${variant}>          
                
        `);
        break;
      case 'iframe':
        console.log(`
${chalk.green.bold('Use this HTML to embed this widget as an IFrame:')}

<iframe src="//www.cloudstitch.com/widget/${user}/${app}"></iframe>
                
        `);
        break;
      case 'wordpress':
        console.log(`
${chalk.green.bold('To place this widget in WordPress')}

${chalk.green('1) Install the Cloudstitch WordPress plugin, found here::')}

  https://wordpress.org/plugins/cloudstitch/

${chalk.green('2) Paste the following short code on the post or page ')}
${chalk.green('   where the widget should apper:')}

[cloudstitch container="${variant}" user="${user}" app="${app}"][/cloudstitch]
                
        `);
        break;
      case 'weebly':
        console.log(`
${chalk.green.bold('To place this widget in Weebly, follow the instructions at this URL:')}

  http://docs.cloudstitch.com/publishing/weebly/?user=${user}&app=${app}&variant=${variant}
                
        `);
        break;
      case 'squarespace':
        console.log(`
${chalk.green.bold('To place this widget in Squarespace, follow the instructions at this URL:')}

  http://docs.cloudstitch.com/publishing/squarespace/?user=${user}&app=${app}&variant=${variant}
                
        `);
        break;
      case 'googlesites':
        console.log(`
${chalk.green.bold('To place this widget in Google Sites, follow the instructions at this URL:')}

  http://docs.cloudstitch.com/publishing/google-sites/?user=${user}&app=${app}&variant=${variant}
                
        `);
        break;
      default:
        logger.error("Unknown usage target");
    }
  }


}

export = new Widget();
import * as inquirer from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import Request from "../lib/request";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import token from "../lib/token";

class Login implements ICommand {
  doc = "login [--status]";
  options: ICommandOptions;
  trys = 0;

  requiresPkg(options: Object) {
    return false;
  }

  requiresLogin(options: Object) {
    return false;
  }

  invocations =['login'];

  run(options: ICommandOptions) {
    this.options = options;
    if(options["--status"]) {
      token().then(() => {
        let Username = config.get("Username");
        logger.success(`Logged in as ${Username}`);
      }, () => {
        logger.error("You are not logged in");
      });
    } else {
      this.trys++;
      let questions = 
      inquirer.prompt([
        {
          type:"input",
          message: "Username",
          name: "username"
        },
        {
          type:"password",
          message: "Password",
          name: "password"
        }
      ]).then(this.runAuth);
    }
  }
  runAuth = (answeres: inquirer.Answers) => {
    let result: any;
      Request.post("/session", {
      user: answeres["username"],
      password: answeres["password"],
      desiredResponse: "web-token"
    }).then((result) => {
      if(result.body.token) {
        config.set("ApiKey", result.body.token);
        config.set("Username", answeres["username"]);
        logger.success("Login Successful");
      }
    }, (result) => {
      logger.error(result.error);
      logger.info(`Attempt ${this.trys}`);
      if(this.trys < 5) {
        this.run(this.options);
      }
    });
  }
}

export =  new Login();

import * as inquirer from "inquirer";

import { ICommand, ICommandOptions } from "./command";
import Request from "../lib/request";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";

class Signup implements ICommand {
  doc = "signup";
  requiresPkg = false;
  requiresLogin = false;
  run(options: ICommandOptions) {
      inquirer.prompt([
      {
        type:"input",
        message: "Username",
        name: "username"
      },
      {
        type:"input",
        message: "E-Mail",
        name: "email"
      },
      {
        type:"password",
        message: "Password",
        name: "password"
      }
    ]).then(this.runSignup);
  }
  runSignup = (ans: inquirer.Answers) => {
    let req = {
      email: ans["email"],
      username: ans["username"],
      password: ans["password"],
      desiredResponse: "token"
    };
    Request.post("/account", req).then((result) => {
      if(result.body.token) {
        logger.success("Account successfully created");
        config.set("ApiKey", result.body.token);
        config.set("Username", ans["username"]);
      }
    }, (result) => {
      logger.error(result.error);
    });
  }
}

export =  new Signup();

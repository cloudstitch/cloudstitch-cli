var prompt = require("prompt");

import { ICommand, ICommandOptions } from "./command";
import Request from "../lib/request";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import token from "../lib/token";

class Login implements ICommand {
  doc = "login [--status]";
  requiresPkg = false;
  requiresLogin = false;
  options: ICommandOptions;
  trys = 0;
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
      var schema = {
        properties: {
          username: {
            required: true
          },
          password: {
            require: true,
            hidden: true
          }
        }
      };
      prompt.get(schema, this.runAuth);
    }
  }
  runAuth = (err, promptRes) => {
    let result: any;
      Request.post("/session", {
      user: promptRes.username,
      password: promptRes.password,
      desiredResponse: "token"
    }).then((result) => {
      if(result.body.token) {
        config.set("ApiKey", result.body.token);
        config.set("Username", promptRes.username);
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

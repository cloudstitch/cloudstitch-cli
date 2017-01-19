var prompt = require("prompt");

import { ICommand, ICommandOptions } from "./command";
import Request from "../request";
import { instance as logger } from "../logger";
import { instance as config } from "../config";

class Login implements ICommand {
  doc = "login [--status]";
  requiresPkg = false;
  requiresLogin = false;
  options: ICommandOptions;
  trys = 0;
  run(options: ICommandOptions) {
    this.options = options;
    if(options["--status"]) {
      let ApiKey = config.get("ApiKey"),
          Username = config.get("Username");;
      if(ApiKey && Username) {
        //TODO should check with backend that token is good
        logger.success(`Logged in as ${Username}`);
      } else {
        logger.error("You are not logged in");
      }
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

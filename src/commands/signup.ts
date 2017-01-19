var prompt = require("prompt");

import { ICommand, ICommandOptions } from "./command";
import Request from "../request";
import { instance as logger } from "../logger";
import { instance as config } from "../config";

class Signup implements ICommand {
  doc = "signup";
  requiresPkg = false;
  requiresLogin = false;
  run(options: ICommandOptions) {
    var schema = {
      properties: {
        username: {
          required: true
        },
        email: {
          required: true
        },
        password: {
          require: true,
          hidden: true
        }
      }
    };
    prompt.get(schema, this.runSignup);
  }
  runSignup = (err, promptResult) => {
    promptResult.desiredResponse = "token";
    Request.post("/account", promptResult).then((result) => {
      if(result.body.token) {
        logger.success("Account successfully created");
        config.set("ApiKey", result.body.token);
        config.set("Username", promptResult.username);
      }
    }, (result) => {
      logger.error(result.error);
    });
  }
}

export =  new Signup();

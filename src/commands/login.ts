var prompt = require("prompt");

import { ICommand, ICommandOptions } from "./command";

class Login implements ICommand {
  doc() {
    return "login";
  }
  run(options: ICommandOptions) {
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
  runAuth = (err, result) => {
    
  }
}

export =  new Login();

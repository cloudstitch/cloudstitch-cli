import ICommand = require("./command");

class Login implements ICommand {
  doc() {
    return `login <username>`;
  }
  run(options: Object) {
    console.log("LOGIN NOT IMPLEMENTED");
  }
}

export =  new Login();

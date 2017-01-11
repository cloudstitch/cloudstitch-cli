import ICommand = require("./command");

class Pull implements ICommand {
  doc() {
    return `pull <user/app>`;
  }
  run(options: Object) {
    console.log("PULL NOT IMPLEMENTED");
  }
}

export =  new Pull();

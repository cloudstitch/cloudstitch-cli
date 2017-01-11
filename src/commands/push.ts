import ICommand = require("./command");

class Push implements ICommand {
  doc() {
    return `push [file]`;
  }
  run(options: Object) {
    console.log("PUSH NOT IMPLEMENTED");
  }
}

export =  new Push();

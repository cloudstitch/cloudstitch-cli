import ICommand = require("./command");

class Serve implements ICommand {
  doc() {
    return `serve`;
  }
  run(options: Object) {
    console.log("SERVE NOT IMPLEMENTED");
  }
}

export =  new Serve();

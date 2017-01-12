import { ICommand, ICommandOptions } from "./command";

class Push implements ICommand {
  doc() {
    return "push [<file>]";
  }
  run(options: Object) {
    console.log("PUSH NOT IMPLEMENTED");
  }
}

export =  new Push();

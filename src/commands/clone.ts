import { ICommand, ICommandOptions } from "./command";

class Clone implements ICommand {
  doc() {
    return "clone <user/app> [<folder>]";
  }
  run(options: Object) {
    console.log("CLONE NOT IMPLEMENTED");
  }
}

export =  new Clone();

import { ICommand, ICommandOptions } from "./command";

class Push implements ICommand {
  doc = "push [<file>]";
  requiresPkg = true;
  requiresLogin = true;
  run(options: Object) {
    console.log("PUSH NOT IMPLEMENTED");
  }
}

export =  new Push();

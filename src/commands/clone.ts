import { ICommand, ICommandOptions } from "./command";

class Clone implements ICommand {
  doc ="clone <user/app> [<folder>]";
  requiresPkg = false;
  requiresLogin = true;
  run(options: Object) {
    console.log("CLONE NOT IMPLEMENTED");
  }
}

export =  new Clone();

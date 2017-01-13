import { ICommand, ICommandOptions } from "./command";

class Pull implements ICommand {
  doc = "pull <user/app>";
  requiresPkg = false;
  requiresLogin = false;
  run(options: Object) {
    console.log("PULL NOT IMPLEMENTED");
  }
}

export =  new Pull();

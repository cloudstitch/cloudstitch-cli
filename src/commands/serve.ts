import { ICommand, ICommandOptions } from "./command";

import Server from "../lib/server";
import { instance as pkg } from "../lib/package";

class Serve implements ICommand {
  doc = "serve [<folder>] [--watch]";

  requiresPkg(options: Object) {
    return true;
  }

  requiresLogin(options: Object) {
    return false;
  }

  invocations = ['serve'];

  run(options: ICommandOptions) {
    let server = new Server(!!options["--watch"],  options["<folder>"]);
    server.run();
  }
}

export =  new Serve();

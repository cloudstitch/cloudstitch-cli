import { ICommand, ICommandOptions } from "./command";

import Server from "../lib/server";
import { instance as pkg } from "../lib/package";

class Serve implements ICommand {
  doc = "serve [<folder>] [--watch]";
  requiresPkg = true;
  requiresLogin = false;
  run(options: ICommandOptions) {
    let server = new Server(!!options["--watch"],  options["<folder>"]);
    server.run();
  }
}

export =  new Serve();

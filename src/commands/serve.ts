import { ICommand, ICommandOptions } from "./command";

import Server from "../server";
import { instance as pkg } from "../package";

class Serve implements ICommand {
  doc = "serve [<folder>]";
  requiresPkg = true;
  requiresLogin = false;
  run(options: ICommandOptions) {
    let server = new Server(options["<folder>"]);
    server.run();
  }
}

export =  new Serve();

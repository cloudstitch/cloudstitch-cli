import { ICommand, ICommandOptions } from "./command";

import Server from "../server";

class Serve implements ICommand {
  doc() {
    return "serve [<folder>]";
  }
  run(options: ICommandOptions) {
    let server = new Server(options["<folder>"]);
    server.run();
  }
}

export =  new Serve();

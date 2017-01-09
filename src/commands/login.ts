import ICommand = require("command");

export class Login implements ICommand {
  static doc() {
    return `login <username>`;
  }
  run(options: Object) {

  }
}

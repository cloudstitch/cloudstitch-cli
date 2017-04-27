
import Spinner from "../lib/spinner";

export interface ICommand{
  doc: string;
  requiresPkg: boolean;
  requiresLogin: boolean;
  run(options: ICommandOptions): void;
}

export interface ICommandOptions {
  clone: boolean;
  login: boolean;
  pull: boolean;
  push: boolean;
  serve: boolean;
  create: boolean;
  signup: boolean;
  "get settings:publish": string;
  "<user/app>": string;
  "<file>": string;
  "<folder>": string;
  "--watch": boolean;
  "--status": boolean;
  "--force": boolean;
}

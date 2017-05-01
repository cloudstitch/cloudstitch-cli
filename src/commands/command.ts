
import Spinner from "../lib/spinner";

export interface ICommand{
  doc: string;
  requiresPkg: (options: Object) => boolean;
  requiresLogin: (options: Object) => boolean;
  run(options: ICommandOptions): void;
  invocations: string[];

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

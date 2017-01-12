
export interface ICommand{
  doc(): string;
  run(options: ICommandOptions): void;
}

export interface ICommandOptions {
  clone: boolean;
  login: boolean;
  pull: boolean;
  push: boolean;
  serve: boolean;

  '<user/app>': string;
  "<file>": string;
  "<folder>": string;
}

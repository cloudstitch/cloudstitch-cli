
interface ICommand{
  doc(): string;
  run(options: Object): void;
}

export = ICommand;

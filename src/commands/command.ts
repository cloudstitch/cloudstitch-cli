
export interface ICommand{
  doc(): string;
  run(options: Object): void;
}

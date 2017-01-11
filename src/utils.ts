import fs = require("fs");

export function loadFile(file: string): string {
  return fs.readFileSync(file).toString("utf8");
};

export function loadJson(file: string): any {
  return JSON.parse(loadFile(file));
}

export function isFile(file: string): boolean {
  return fs.statSync(file).isFile();
}

export function isDirectory(file: string): boolean {
  return fs.statSync(file).isDirectory();
}

import * as fs from "fs";
import * as path from "path";

export function loadFile(file: string): string {
  return fs.readFileSync(file).toString("utf8");
};

export function loadJson(file: string): any {
  return JSON.parse(loadFile(file));
}

export function isFile(file: string): boolean {
  try {
    return fs.statSync(file).isFile();
  } catch(e) {
    return false;
  }
}

export function isDirectory(file: string): boolean {
  return fs.statSync(file).isDirectory();
}

export interface FilePathAndContents {
  filePath: string,
  basePath: string,
  fileJson: Object
}

export const homePath = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];

export function readFromParent(currentPath: string, fileName: string): FilePathAndContents {
  //stop at the home dir
  //TODO test this on windows, perhaps living in C:/dev or simmillar will break this.
  if(currentPath === homePath) {
    return {
      filePath: undefined,
      basePath: undefined,
      fileJson: undefined
    };
  }
  var configFile = path.join(currentPath, fileName);
  if(isFile(configFile)) {
    return {
      filePath: configFile,
      basePath: currentPath,
      fileJson: loadJson(configFile)
    };
  } else {
    return readFromParent(path.resolve(currentPath, "../"), fileName);
  }
}
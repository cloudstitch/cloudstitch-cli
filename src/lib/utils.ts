import * as fs from "fs";
import * as path from "path";

import * as Q from "q";

export function loadFile(file: string): string {
  try {
    return fs.readFileSync(file).toString("utf8");
  } catch(e) {
    return undefined;
  }
};

export async function loadFilePromise(filePath: string): Promise<string> {
  let fileContent;
  try {
    fileContent = await Q.nfcall(fs.readFile, filePath);
  } catch(e) {}
  if(fileContent) {
    return fileContent.toString("utf-8");
  } else {
    return undefined;
  }
}

export function loadJson(file: string): any {
  let jsonFile = loadFile(file);
  if(jsonFile) {
    return JSON.parse(jsonFile);
  } else {
    return undefined;
  }
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
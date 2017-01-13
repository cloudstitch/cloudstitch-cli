import * as path from "path";
import * as fs from "fs";

import * as utils from "./utils";

export class Config {
  homePath: string;
  homeConfigFile: string;
  localConfigFile: string;
  localConfig: Object;
  homeConfig: Object;
  homeFileName = process.platform === "win32" ? ".cloudstitch" : "cloudstitch.json";
  localFileName = ".cloudstitch";
  constructor() {
    this.homePath = utils.homePath;
    let fileDetails = utils.readFromParent(process.cwd(), this.localFileName);
    this.localConfig = fileDetails.fileJson || {};
    this.localConfigFile = fileDetails.filePath || path.join(process.cwd(), this.localFileName);
    this.homeConfig = this._readHomeConfig() || {};
  }
  _readHomeConfig(): Object {
    var homeConfigPath = path.join(this.homePath, ".config");
    if(process.platform !== "win32" && !utils.isDirectory(homeConfigPath)) {
      fs.mkdirSync(homeConfigPath);
    }
    this.homeConfigFile = path.join(process.platform === "win32" ? this.homePath : homeConfigPath, this.homeFileName)
    if(utils.isFile(this.homeConfigFile)) {
      return utils.loadJson(this.homeConfigFile);
    } else {
      return {};
    }
  }
  get(key: string): string {
    if(this.localConfig && this.localConfig[key]) {
      return this.localConfig[key];
    } else if(this.homeConfig && this.homeConfig[key]) {
      return this.homeConfig[key];
    } else {
      return undefined;
    }
  }
  set(key: string, value: string, local=false) {
    if(local && this.localConfigFile) {
      this.localConfig[key] = value;
      fs.writeFileSync(this.localConfigFile, JSON.stringify(this.localConfig));
    } else {
      this.homeConfig[key] = value;
      fs.writeFileSync(this.homeConfigFile, JSON.stringify(this.homeConfig));
    }
  }
}

export const instance = new Config();

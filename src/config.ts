import path = require("path");
import fs = require("fs");

import utils = require("./utils");

export class Config {
  homePath: string;
  homeConfigFile: string;
  localConfigFile: string;
  localConfig: Object;
  homeConfig: Object;
  contructor() {
    this.homePath = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
    this.localConfig = this._readFromParent(process.cwd());
    this.homeConfig = this._readHomeConfig();
  }
  _readFromParent(currentPath: string): Object {
    //stop at the home dir
    //TODO test this on windows, perhaps living in C:/dev or simmillar will break this.
    if(currentPath === this.homePath) {
      this.localConfigFile = path.join(process.cwd(), ".cloudstitch");
      return {};
    }
    var configFile = path.join(currentPath, ".cloudstitch");
    if(utils.isFile(configFile)) {
      this.localConfig = configFile;
      return utils.loadJson(configFile);
    } else {
      return this._readFromParent(path.resolve(currentPath, "../"));
    }
  }
  _readHomeConfig(): Object {
    var homeConfigPath = path.join(this.homePath, ".config");
    if(process.platform !== "win32" && !utils.isDirectory(homeConfigPath)) {
      fs.mkdirSync(homeConfigPath);
    }
    this.homeConfigFile = path.join(process.platform === "win32" ? this.homePath : homeConfigPath, ".cloudstitch");
    if(utils.isFile(this.homeConfigFile)) {
      return utils.loadJson(this.homeConfigFile);
    } else {
      return {};
    }
  }
  get(key: string): string {
    return this.localConfig[key] || this.homeConfig[key];
  }
  set(key: string, value: string, local=false) {
    if(local) {
      this.localConfig[key] = value;
      fs.writeFileSync(this.localConfigFile, JSON.stringify(this.localConfig));
    } else {
      this.homeConfig[key] = value;
      fs.writeFileSync(this.homeConfigFile, JSON.stringify(this.localConfig));
    }
  }
}

export var instance = new Config();

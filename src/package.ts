import * as path from "path";

import * as utils from "./utils";
import { instance as logger } from "./logger";

class PackageDef {
  user: string;
  app: string;
  variant: string;
  constructor(user: string, app: string, variant: string) {
    this.user = user;
    this.app = app;
    this.variant = variant;
  }
}

export class Package {
  pagkaceDefName = "cloudstitch.json";
  packageRootPath: string;
  packageDef: PackageDef;
  constructor(basePath?: string) {
    if(basePath) {
      this.packageRootPath = path.resolve(process.cwd(), basePath);
      let loadedJson = utils.loadJson(path.join(this.packageRootPath, this.pagkaceDefName));
      this.packageDef = new PackageDef(
        loadedJson["user"],
        loadedJson["app"],
        loadedJson["variant"]);
    } else {
      let fileDetails = utils.readFromParent(process.cwd(), this.pagkaceDefName);
      if(fileDetails.fileJson) {
        this.packageDef = new PackageDef(
          fileDetails.fileJson["user"],
          fileDetails.fileJson["app"],
          fileDetails.fileJson["variant"]);
      }
      this.packageRootPath = fileDetails.basePath;
    }
    logger.info(`Read package information from ${this.packageRootPath}:${JSON.stringify(this.packageDef)}`)
  }
  isInvalid(): any {
    let result: any = {},
        invalid = false;
    if(!this.packageDef) {
      invalid = true;
      result.notFound = true;
    } else if(this.packageDef && (typeof this.packageDef.user !== "string"
      || typeof this.packageDef.user !== "string"
      || typeof this.packageDef.variant !== "string")) {
        invalid = true;
        result.packageMalformed = true;
    }
    if(!invalid) {
      return invalid;
    } else {
      return result;
    }
  }
  get(key: string): string {
    return this.packageDef ? this.packageDef[key] : undefined;
  }
}

export const instance = new Package();
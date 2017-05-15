import * as path from "path";

import * as utils from "./utils";
import { instance as logger } from "./logger";

export interface ICloudFolderTemplate {
  service: "google" | "microsoft";
  folderKey: string;
  spreadsheetApiKey: string;
}

export interface IGitRepoTemplate {
  url: string;
}

export interface ICloudstitchProject {
  user: string;
  app: string;
}

export interface PackageTemplate {
  name?: string;
  description?: string,
  type?: "site",
  cloudFolder?: ICloudFolderTemplate,
  gitRepo?: IGitRepoTemplate
  cloudstitchProject?: ICloudstitchProject
}

export class PackageDef {
  user: string;
  app: string;
  variant: string;

  template?: PackageTemplate;

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
    let packageJson;
    if(basePath) {
      this.packageRootPath = path.resolve(process.cwd(), basePath);
      let packageJson = utils.loadJson(path.join(this.packageRootPath, this.pagkaceDefName));
    } else {
      let fileDetails = utils.readFromParent(process.cwd(), this.pagkaceDefName);
      this.packageRootPath = fileDetails.basePath;
      packageJson = fileDetails.fileJson;
    }
    if(packageJson) {
      this.packageDef = new PackageDef(
        packageJson["user"],
        packageJson["app"],
        packageJson["variant"]);
      if (packageJson['template']) {
        this.packageDef.template = packageJson.template;
      }
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
    logger.info(`Package detected as invalid(${invalid}) at path: ${this.packageRootPath}`);
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
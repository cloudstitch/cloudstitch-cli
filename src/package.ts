import * as path from "path";

import * as utils from "./utils";

export class Package {
  pagkaceDefName = "cloudstitch.json";
  packageRootPath: string;
  packageDef: Object;
  constructor(basePath?: string) {
    if(basePath) {
      this.packageRootPath = path.resolve(process.cwd(), basePath);
      this.packageDef = utils.loadJson(path.join(this.packageRootPath, this.pagkaceDefName))
    } else {
      let fileDetails = utils.readFromParent(process.cwd(), this.pagkaceDefName,);
      this.packageDef = fileDetails.fileJson;
      this.packageRootPath = fileDetails.basePath;
    }
  }
  get(key: string): string {
    return this.packageDef ? this.packageDef[key] : undefined;
  }
}

export const instance = new Package();
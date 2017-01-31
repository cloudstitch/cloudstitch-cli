import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

let Zip = require("jszip");
import * as JSZip from "jszip";
import * as Q from "q";

import Request, { IRequestResult } from "./request";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import * as utils from "../lib/utils";


export interface IProjectDetails {
  user?: string;
  app?: string;
}

function _shouldAddFile(file: string, thisHash: string, hashes: any): boolean {
  logger.info(`Should add ${file} ?`);
  if(typeof hashes === "undefined") {
    logger.info("Yes, no hash file");
    return true;
  }
  if(hashes[file]) {
    logger.info(`Checking hashes ${hashes[file]} !== ${thisHash} : ${hashes[file] !== thisHash}`)
    return hashes[file] !== thisHash;
  } else {
    logger.info("yes the hash was not in the hash file.")
    return true;
  }
}

async function _loadHashFile(folder: string): Promise<any> {
  let hashFile, hashes;
  try {
    hashFile = <Buffer> await Q.nfcall(fs.readFile, path.join(folder, "cloudstitch.md5"));
    hashFile = hashFile.toString("utf-8");
    logger.info(`loaded md5 file: ${hashFile}`);
  } catch (e) {} // hash file does not exist
  if(hashFile && typeof hashFile === "string") {
    hashes = {};
    hashFile.split("\n").forEach((line) => {
      if(line.length > 1) {
        let lineParts = line.split(" ");
        hashes[lineParts[0]] = lineParts[1];
      }
    });
  }
  logger.info(`parsed hash file: ${JSON.stringify(hashes)}`);
  return hashes;
}
async function _writeNewHashes(file: string, hashes: Object) {
  let hashFile = "";
  Object.keys(hashes).forEach((filePath) => hashFile = `${hashFile}${filePath} ${hashes[filePath]}\n`);
  await Q.nfcall(fs.writeFile, file, hashFile);
}

export default class Project {
  static verifyIdentifier(identifier: string): IProjectDetails {
    if(!identifier || identifier.indexOf("/") === -1) {
      return {};
    }
    let userAppParts = identifier.split("/");
    if(userAppParts.length !== 2 || userAppParts[0].length < 1 || userAppParts[1].length < 1) {
      return {};
    }
    return {
      user: userAppParts[0],
      app: userAppParts[1]
    }
  }

  static async pull(folder: string, user: string, app: string) {
    let result;
    try{
      result = await Request.get(`/project/${user}/${app}`);
    } catch(e) {
      //TODO Check that these are happening
      if(e.statusCode && e.statusCode === 404) {
        throw new Error("Project not found");
      } else if(e.statusCode && e.statusCode === 401) {
        throw new Error("Permission denied");
      } else {
        throw e;
      }
    }
    let fileContent = Buffer.from(result.body, "binary");
    let zip = await Zip.loadAsync(fileContent);
    zip.forEach(async (filePath, file) => {
      let finalFilePath = path.join(folder, filePath);
      logger.info(`Created: ${finalFilePath}`);
      if(file.dir) {
        fs.mkdirSync(finalFilePath);
      } else {
        let fileContent = await file.async("nodebuffer");
        fs.writeFileSync(finalFilePath, fileContent);
      }
    });
  }

  static async zip(folder: string, baseDir?: string, zip?: JSZip, hashes?: any, newHashes?: any): Promise<JSZip | Buffer> {
    if(!baseDir) {
      baseDir = folder;
    }
    let files: string[] = <string[]> await Q.nfcall(fs.readdir, folder);
    files = files.filter(file => file !== "cloudstitch.md5");
    let top = false;
    if(!zip) {
      zip = new JSZip();
      top = true;
      hashes = await _loadHashFile(folder);
      newHashes = {};
    }
    logger.info(`starting zip of dir: ${folder}`);
    for(let file of files) {
      let stat: fs.Stats = <fs.Stats> await Q.nfcall(fs.stat, path.join(folder, file));
      if(stat.isDirectory()) {
        zip = <JSZip> await Project.zip(path.join(folder, file), baseDir, zip, hashes, newHashes);
      } else if(stat.isFile()) {
        let fileContent: Buffer = <Buffer> await Q.nfcall(fs.readFile, path.join(folder, file)),
            dirDifference = folder.replace(baseDir, ""), //get relative path
            thisHash = crypto.createHash("md5").update(fileContent).digest("hex");
        if(dirDifference && dirDifference.charAt(0) === "/") {
          dirDifference = dirDifference.slice(1); //remove leading slash
        }
        if(dirDifference && dirDifference.length > 0) {
          newHashes[`${dirDifference}/${file}`] = thisHash;
          if(_shouldAddFile(`${dirDifference}/${file}`, thisHash, hashes)) {
            zip.folder(dirDifference).file(file, fileContent);
          }
        } else {
          let basePath = file.replace(baseDir+"/", "");
          newHashes[basePath] = thisHash;
          if(_shouldAddFile(file, thisHash, hashes)) {
            zip.file(file, fileContent);
          }
        }
      }
    }
    if(top) {
      if(Object.keys(zip.files).length === 0) {
        logger.warn("There does not seem to be any change.");
        return null;
      } else {
        await _writeNewHashes(`${folder}/cloudstitch.md5`, newHashes);
        return zip.generateAsync({
          type: "nodebuffer",
          compression: "DEFLATE",
        });
      }
    } else {
      return zip;
    }
  }

  static async push(folder: string, user: string, app:string): Promise<IRequestResult> {
    let zip: Buffer = <Buffer> await Project.zip(folder);
    return Request.post(
      `/project/${user}/${app}`,
      zip.toString("binary"),
      false,
      "application/zip"
    );
  }

  static async clone(title: string, from: string, backend: "google" | "microsoft"): Promise<string> {
    //TODO get the final URL for this.
    let req = {
      title,
      backend,
      fromProject: from
    };
    let res = await Request.post("http://cloudstitch.com/api/clone", req);
    //TODO verify this data responce pattern
    let appName = res.body.appName;

    let finished = false;
    while(!finished) {
      await utils.setTimeoutPromise(500);
      // TODO get this status check for this url
      let statusCheck = await Request.get(
        `http://cloudstitch.com/api/cloneStatus/${config.get("Username")}/${appName}`
      );
      //TODO verify this status result patern
      finished = statusCheck.body.finished;
    }
    return appName;
  }

  static map(frontend: string): string {
    return "handlebars";
  }
}
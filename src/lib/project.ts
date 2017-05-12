import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

let Zip = require("jszip");
import * as JSZip from "jszip";
import * as Q from "q";
import { Diff3 } from "@cloudstitch/node-diff3-wrapper";

import Request, { IRequestResult } from "./request";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import * as utils from "../lib/utils";

export interface IProjectDetails {
  user?: string;
  app?: string;
}

interface ICloneStatusResponse {
  status: 'never' | 'waiting' | 'progress' | 'success' | 'fail' | 'error';
  statusDate: number;
  statusMessage?: string;
  statusObject?: any;  
}

export type BackendStack = "google" | "microsoft";
export type FrontendStack = "d3" | "dust" | "ejs" | "handlebars" | "jade" | "mustache" | "polymer";

export type PublishDefenition = {
  repoUrl: string;
  repoBranch: string;
  exports?: {
    sheet?: {
      export: boolean;
      repoPath: string;
    },
    files?: {
      export: boolean;
      repoPath: string;
    }
  }
}

export interface IProjectTemplateRequest {
  url?: string,
  json?: any,
  user?: string,
  app?: string
}

export interface ICloneRequest {
  projectTemplate: IProjectTemplateRequest,
  toUser?: string;
  name: string; // e.g., "My new Project"
  private?: boolean;
  backendStack: BackendStack;
  frontEnd?: FrontendStack; // The web interface will send this.
}

export interface ICloneResponse {
  user?: string; // the user who has just initiated a clone
  app?: string; // the appname assigned by cloudstitch to the new app (user doesn't get to choose this!)
  error?: boolean; // true if there was an error
  message?: string; // present if there was an error
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

async function _loadHashFile(folder: string, fileContent?: string): Promise<any> {
  let hashFile, hashes;
  try {
    if(!fileContent) {
      let hashFilePath = path.join(folder, ".cloudstitch", "cloudstitch.md5");
      logger.info(`reading hash file ${hashFilePath}`);
      hashFile = <Buffer> await Q.nfcall(fs.readFile, hashFilePath);
      hashFile = hashFile.toString("utf-8");
      logger.info(`loaded md5 file: ${hashFile}`);
    }
  } catch (e) {} // hash file does not exist
  if(fileContent) {
    logger.info("reading hashes from string");
    hashFile = fileContent;
  }
  logger.info(`Parsing hash file: ${hashFile}`);
  if(typeof hashFile === "string") {
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

function cleanUpDiff(file: string): string {
  let splitFile = file.split("\n");
  let result = [];
  let skip = false;
  for(let line of splitFile) {
    if(/\|{7}/.exec(line)) {
      skip = true;
    } else if(/={7}/.exec(line)) {
      skip = false;
      result.push("=".repeat(8));
    } else if(/<{7}/.exec(line)) {
      result.push("<".repeat(8));
    } else if(/>{7}/.exec(line)) {
      result.push(">".repeat(8));
    } else if(!skip) {
      result.push(line);
    }
  }
  return result.join("\n");
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

  static async getSettings(user: string, app: string, component: string) {
    let settingsUrl = `/project/${user}/${app}/settings/${component}`
    let settingsResp = await Request.get(settingsUrl);
    let settingsJson: ICloneStatusResponse = settingsResp.body;
    return settingsJson;
  }

  static async getInfo(user: string, app: string, url: string, json: string) {
    let settingsUrl;
    let settings;
    let settingsJson;

    if (url) {
      settingsUrl = `/project/${user}/${app}/infocard`;
    } else {
      settingsUrl = `/project/${user}/${app}/infocard`;
    }
    
    if (json) {
      try {
        settings = fs.readFileSync(json).toString();
      } catch(ex) {
        logger.error("Unable to read your settings file");
        return;
      }

      try {
        settingsJson = {json: JSON.parse(settings).projectTemplate};
      } catch(ex) {
        logger.error("This settings JSON isn't well formed");
        return;
      }
    
      let settingsResp = await Request.post(settingsUrl, settingsJson);
      return settingsResp;
    } else {
      let settingsResp = await Request.get(settingsUrl);
      let settingsJson = settingsResp.body;
      return settingsJson;
    }
  }

  static async setSettings(user: string, app: string, component: string, filename: string) {
    let settings;
    let settingsJson;
    let settingsUrl = `/project/${user}/${app}/settings/${component}`
    
    console.log("PATH", settingsUrl);

    try {
      settings = fs.readFileSync(filename).toString();
    } catch(ex) {
      logger.error("Unable to read your settings file");
      return;
    }

    try {
      settingsJson = JSON.parse(settings);
    } catch(ex) {
      logger.error("This settings JSON isn't well formed");
      return;
    }

    console.log("SET", settingsJson);

    let settingsResp = await Request.post(settingsUrl, settingsJson);
    logger.info(`Deployed settings: \n\n ${JSON.stringify(settingsJson, undefined, 2)}\n\n`);
    return settingsResp;
  }

  static async list(user: string) {
    let listResp = await Request.get(`/projects/${user}`);

    if (listResp && listResp.body) {
      for (var app of listResp.body) {
        logger.info(`- ${user}/${app.appname}`)
      }
    } else {
      logger.info('No apps found.');
    }
  }

  static async removeObject(user: string, app: string, component: string, id: string) {
    logger.info(`IMPLEMENT`);
  }

  static async listObjects(user: string, app: string, component: string) {
    logger.info(`IMPLEMENT`);
  }

  static async addObject(user: string, app: string, component: string, filename: string) {
    logger.info(`IMPLEMENT`);
  }


  static async delete(user: string, app: string) {
    let deleteUrl = `/project/${user}/${app}/delete`
    let deleteResp = await Request.post(deleteUrl, {});
    logger.info(`Deleted`);
  }

  static async pull(folder: string, user: string, app: string, force: boolean) {
    let checkAppDir;
    try {
      checkAppDir = fs.statSync(folder);
      logger.info(`App dir stat: ${JSON.stringify(checkAppDir)}`)
    } catch(e) {} // if error happens we might be ok
    if(!checkAppDir) {
      fs.mkdirSync(folder);
    }
    logger.info(`Detected app dir: ${folder}`);

    let hashCodes = await _loadHashFile(folder);
    let result;
    try{
      result = await Request.get(`/project/${user}/${app}/pull`);
    } catch(e) {
      if(e.res.statusCode && e.res.statusCode === 404) {
        throw new Error("Project not found");
      } else if(e.res.statusCode && e.res.statusCode === 401) {
        throw new Error("Permission denied");
      } else {
        throw e;
      }
    }
    try {
      await Q.nfcall(fs.mkdir, path.join(folder, ".cloudstitch"))
    } catch(e) {} //don't care if this errors
    logger.info(`Got responce back from server pull: ${result.res.statusCode}`);
    let zip;
    try {
      zip = await Zip.loadAsync(result.body);
    } catch(e) {
      logger.error(e.message);
    }
    logger.info("Zip responce successfully intrpreted");
    let zipMd5FileContent: string = await zip.file("cloudstitch.md5").async("string");
    let zipMd5FileHashes = await _loadHashFile(null, zipMd5FileContent);
    zip.forEach(async (filePath, file) => {
      logger.info(`Processing: ${filePath}`);
      let finalFilePath = path.join(folder, filePath);

      let writeFile = false;
      if(!hashCodes) {
        if(file.dir) {
          fs.mkdirSync(finalFilePath);
        } else {
          writeFile = true;
        }
      } else {
        if(!file.dir) {
          let stat;
          try {
            stat = fs.statSync(finalFilePath);
          } catch(e) {}
          logger.info(`Going to check local file. file exists: ${!!stat}, file has old hash: ${!!hashCodes[filePath]}, have past file hash: ${filePath !== "cloudstitch.md5"}`);
          if(stat && hashCodes[filePath] && filePath !== "cloudstitch.md5") { 
            let oldFileContent = fs.readFileSync(finalFilePath);
            let fileHash = crypto.createHash("md5").update(oldFileContent).digest("hex");
            let modifedLocally = fileHash !== hashCodes[filePath];
            let modifiedRemotely = hashCodes[filePath] !== zipMd5FileHashes[filePath];
            logger.debug(`checking hash ${filePath} local: ${modifedLocally}, remote ${modifiedRemotely}`);
            if(modifedLocally && modifiedRemotely) {
              //merge
              let originalFilePath = path.join(folder, ".cloudstitch", filePath);
              let a = oldFileContent.toString("utf-8");
              let b = (<Buffer>await file.async("nodebuffer")).toString("utf-8");
              let diff: string;
              try {
                logger.info(`Calling: diff3 -m ${finalFilePath} ${originalFilePath} - stdin: ${b}`)
                diff = await Diff3.diffM(finalFilePath, originalFilePath, "-", b);
              } catch(e) {
                logger.error(e);
              }

              if(diff) {
                diff = cleanUpDiff(diff);
                if(diff.indexOf("=".repeat(8)) !== -1) {
                  logger.error(`Conflict in ${filePath} please resolve manually`);
                } else {
                  logger.warn(`Conflict in ${filePath} resolved automatically`);
                }
                fs.writeFileSync(finalFilePath, diff);
              }
            }
          } else {
            writeFile = true;
          }
        }
      }
      if(writeFile) {
        let fileContent = await file.async("nodebuffer");
        if(filePath !== "cloudstitch.md5") {
          fs.writeFileSync(finalFilePath, fileContent);
          logger.info(`Wrote content of file: ${finalFilePath}`);
        }
        let cacheFilePath = path.join(folder, ".cloudstitch", filePath);
        fs.writeFileSync(cacheFilePath, fileContent);
        logger.info(`Wrote content of file: ${cacheFilePath}`);
      } else {
        logger.debug(`skipping ${filePath}`);
      }
    });
  }

  static async zip(folder: string, baseDir?: string, zip?: JSZip, hashes?: any, newHashes?: any): Promise<JSZip | Buffer> {
    if(!baseDir) {
      baseDir = folder;
    }
    let files: string[] = <string[]> await Q.nfcall(fs.readdir, folder);
    files = files.filter(file => file !== "cloudstitch.md5" && file !== ".cloudstitch");
    logger.info(`Found files: ${JSON.stringify(files)}`);
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
        if(fileContent.toString("utf-8").indexOf("<".repeat(8)) !== -1) {
          throw new Error(`It looks like there is a merge conflict in file ${file}, please manualy resolve this before pushing.`);
        }
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
        throw new Error("There does not seem to be any changes, nothing to do.");
      } else {
        await _writeNewHashes(`${folder}/.cloudstitch/cloudstitch.md5`, newHashes);
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
    let hashes = await _loadHashFile(folder),
    fileHashes = Object.keys(hashes).map((key) => {
      return {
        key,
        hash: hashes[key]
      };
    });
    let canPush = await Request.put(`project/${user}/${app}/push-check`, { fileHashes });
    if(!canPush.body.valid) {
      throw new Error("There were changes made on the server since your last pull. Pull now, then you will be able to push.");
    }
    let zip: Buffer = <Buffer> await Project.zip(folder);
    return await Request.put(
      `/project/${user}/${app}/push`,
      zip,
      false,
      "application/zip"
    );
  }

  static async clone(name: string, from: string, backendStack: BackendStack, frontEnd?: FrontendStack): Promise<string> {
    let fromParts = from.split("/"),
        user = fromParts[0],
        app = fromParts[1],
        req: ICloneRequest = {
          projectTemplate: {
            user: user,
            app: app
          },
          name,
          backendStack
        };
    if(frontEnd) {
      req.frontEnd = frontEnd;
    }
    let res: IRequestResult = await Request.post(`/project/${user}/${app}/clone`, req);
    let cloneRes: ICloneResponse = res.body,
        appName = cloneRes.app,
        appUsername = cloneRes.user;

    let finished = false;
    while(!finished) {
      await utils.setTimeoutPromise(500);
      let statusCheck = await Request.get(`/project/${appUsername}/${appName}/clone-status`);
      let cloneStatus: ICloneStatusResponse = statusCheck.body;
      logger.info(`clone status ${cloneStatus.status}`)
      finished = cloneStatus.status === "success";
      if(cloneStatus.status === "fail" || cloneStatus.status === "error") {
        throw new Error(cloneStatus.statusMessage);
      }
    }
    return appName;
  }

  static async getPublishConfiguration(user:string, app:string): Promise<PublishDefenition> {
    let res = await Request.get(`/project/${user}/${app}/publish-config`);
    return res.body;
  }

  static async updatePublishConfiguration(user:string, app:string, config: PublishDefenition) {
    let res = await Request.get(`/project/${user}/${app}/publish-config`);
    return res.body;
  }

  static async initiatePublish(user: string, app:string) {
    let res =await Request.post(`project/${user}/${app}/publish`, {});
    return res.body;
  }

  static async initiatePublishSheet(user: string, app:string) {
    let res =await Request.post(`project/${user}/${app}/publish_sheet`, {});
    return res.body;
  }

  static async getTaskStatus(user: string, app:string, category:string, label:string, task:string, kind?:string) {
    let res;
    if (kind) {
      res = await Request.get(`tasks/${user}/${app}/${category}/${label}/${task}/${kind}`);
    } else {
      res = await Request.get(`tasks/${user}/${app}/${category}/${label}/${task}`);
    }
    logger.info(`\n\n${JSON.stringify(res.body, undefined, 2)}\n\n`)
    return res.body;
  }

}

export async function checkAuthToken(serviceName: string): Promise<boolean> {
  let res = await Request.get(`/auth/${serviceName}`);
  return res.body.success;
}

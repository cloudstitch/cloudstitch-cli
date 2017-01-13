import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import * as q from "q";
let mime = require("mime-types");
let opn = require("opn");

import { instance as config } from "../config";
import { instance as pkg, Package } from "../package";
import buildHtml from "./buildHtml";
import buildComponent from "./buildComponent";
import * as utils from "../utils";

import {instance as logger} from "../logger";

interface IncomingMessage extends http.IncomingMessage {
  path: string;
}

class Responce {
  status: number;
  content: string;
  contentType: string;
  constructor(status: number, content: string, contenType: string) {
    this.status = status;
    this.content = content;
    this.contentType = contenType;
  }
};

export default class Server {
  basePath: string;
  port: number;
  server: http.Server;
  pkg: Package;
  notFound = new Responce(404, "<h1>Not Found</h1>", "text/html");
  constructor(basePath?: string) {
    this.basePath = basePath;
    this.pkg = this.basePath ? new Package(this.basePath) : pkg;
    this.port = parseInt(config.get("port")) || process.env.PORT || 8080;
    logger.info(`building server on ${this.basePath || this.pkg.packageRootPath} with port ${this.port}`)
  }
  run() {
    this.server = http.createServer(this.handleReq);
    this.server.listen(this.port, () => {
      logger.warn(`Listening on ${this.port}.`);
      opn(`http://localhost:${this.port}`);
    });
  }
  handleReq = (req: IncomingMessage, res: http.ServerResponse) => {
    req.path = url.parse(req.url).path;
    let result: q.Promise<Responce>;
    let binary = false;
    if(req.path === "/" || req.path === "index.html") {
      result = this.handleRoot();
    } else if (this.pkg.get("variant") === "polymer" && req.path === "/component") {
      result = this.handleComponent();
    } else {
      binary = true;
      result = this.handleStatic(req.path);
    }
    result.then(this.dispatchResponce(req, res, binary)).catch(this.dispatchResponce(req, res, binary));
  }
  dispatchResponce(req: IncomingMessage, res: http.ServerResponse, binary: boolean) {
    return (responce: Responce) => {
      res.statusCode = responce.status;
      res.setHeader('Conten-Type', responce.contentType);
      logger.debug(`[${req.path}] => {${responce.status}}: ${responce.contentType}`);
      if(binary) {
        res.write(responce.content, "binary");
      } else {
        res.write(responce.content);
      }
      res.end();
    };
  }
  handleRoot(): q.Promise<Responce>  {
    return q.Promise<Responce>((resolve, reject) => {
      resolve(new Responce(200, buildHtml(this.port, this.pkg), "text/html"));
    });
  }
  handleStatic(baseUrl: string): q.Promise<Responce> {
    return q.Promise<Responce>((resolve, reject) => {
      let baseAppUrl = `\/${this.pkg.get("user")}\/${this.pkg.get("app")}`;
      if(baseUrl.indexOf(baseAppUrl) !== -1) {
        baseUrl = baseUrl.replace(baseAppUrl, "");
      }
      let filePath = path.join(this.pkg.packageRootPath, baseUrl);
      fs.stat(filePath, (err, stat) => {
        if(err) {
          reject(this.notFound);
        } else {
          fs.readFile(filePath, "binary", (err, file) => {
            if(err) {
              reject(this.notFound);
            } else {
              let extension = filePath.split(".")[1];
              resolve(new Responce(200, file, mime.lookup(extension)));
            }
          });
        }
      })
    });
  }
  handleComponent(): q.Promise<Responce> {
    return q.Promise<Responce>((resolve, reject) => {
      let promises = ["styles.css", "scripts.js", "widget.html"].map((file: string) => {
        return utils.loadFilePromise(path.join(this.pkg.packageRootPath, file));
      })
      q.all(promises).then((files) => {
        resolve(new Responce(200, buildComponent(files[0], files[1], files[2], this.pkg), mime.lookup("html")))
      });
    });
  }
};

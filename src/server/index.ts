import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
let opn = require('opn');

import { instance as config } from "../config";
import { instance as pkg, Package } from "../package";

import buildHtml from "./buildHtml";

interface IncomingMessage extends http.IncomingMessage {
  path: string;
}

export default class Server {
  basePath: string;
  port: number;
  server: http.Server;
  pkg: Package;
  constructor(basePath?: string) {
    this.basePath = basePath;
    this.pkg = this.basePath ? new Package(this.basePath) : pkg;
    this.port = parseInt(config.get("port")) || process.env.PORT || 8080;
  }
  run() {
    this.server = http.createServer(this.handleReq);
    this.server.listen(this.port, () => {
      console.log(`Listening on ${this.port}.`);
      opn(`http://localhost:${this.port}`)
    });
  }
  handleReq = (req: IncomingMessage, res: http.ServerResponse) => {
    req.path = url.parse(req.url).path;
    if(req.path === "/" || req.path === "index.html") {
      this.handleRoot(req, res);
    } else if (req.path === "component" && pkg.get("varient") === "polymer") {
      this.handleComponent(req, res);
    } else{
      this.handleStatic(req, res);
    }
  }
  handleRoot = (req: IncomingMessage, res: http.ServerResponse) => {
    if(pkg.get("variant") === "polymer") {
      //TODO Handle this special case, maybe
    } else {
      res.statusCode = 200;
      res.end(buildHtml(this.pkg));
    }
  }
  handleStatic = (req: IncomingMessage, res: http.ServerResponse) => {
    let filePath = path.join(this.pkg.packageRootPath, req.path);
    fs.stat(filePath, (err, stat) => {
      if(err) {
        this.sendNotFound(res);
      } else {
        fs.readFile(filePath, (err, file) => {
          if(err) {
            this.sendNotFound(res);
          } else {
            res.statusCode = 200;
            res.end(file);
          }
        });
      }
    })
  }
  sendNotFound(res: http.ServerResponse) {
    res.statusCode = 404;
    res.end();
  }
  handleComponent = (req: IncomingMessage, res: http.ServerResponse) => {
    //TODO Build this components html
  }
}

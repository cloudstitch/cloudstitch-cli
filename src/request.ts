import * as request from "request";

import { instance as config } from "./config";
import { instance as logger } from "./logger";

export class Request {
  get(url: string, cb: request.RequestCallback) {
    this._makeRequest("GET", url, cb);
  }
  post(url: string, body: any, cb: request.RequestCallback, json = true) {
    this._makeRequest("POST", url, cb, body, json);
  }
  put(url: string, body: any, cb: request.RequestCallback, json = true) {
    this._makeRequest("PUT", url, cb, body, json);
  }
  delete(url: string, cb: request.RequestCallback) {
    this._makeRequest("DELETE", url, cb);
  }
  _makeRequest(method: string, path: string, cb: request.RequestCallback, body?: any, json = false) {
    let url = `${config.get("baseApiEndPoint") || 'https://api.cloudstitch.com'}/${path}`;
    let headers = {
      "User-Agent": `${process.title}-cli`
    };
    if(config.get("ApiKey")) {
      headers["Authorization"] = `Bearer ${config.get("ApiKey")}`;
    }
    logger.debug(`[${method}]: ${url}`)
    request({
      method,
      headers,
      url,
      body,
      json
    }, cb);
  }
}

export const instance = new Request();
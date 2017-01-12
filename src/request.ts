import * as request from "request";

import { instance as config } from "./config";

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
  _makeRequest(method: string, url: string, cb: request.RequestCallback, body?: any, json = false) {
    //TODO Add header with token?
    request({
      method,
      headers: {
        "User-Agent": `${process.title}-cli`,
        "Authorization": `Bearer ${config.get("ApiKey")}`
      },
      url: `https://api.clousstatich/v1/${url}`,
      body,
      json
    }, cb);
  }
}

export const instance = new Request();
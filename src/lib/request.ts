import * as url from "url";

import * as request from "request";

import { instance as config } from "./config";
import { instance as logger } from "./logger";

export interface IRequestResult {
  body?: any,
  res?: request.RequestResponse,
  error?: any
}

export default class Request {
  static async get(path: string): Promise<IRequestResult> {
    return this._makeRequest("GET", path);
  }
  static async post(path: string, body: any, json = true, contentType?: string): Promise<IRequestResult> {
    return this._makeRequest("POST", path, body, json, contentType);
  }
  static async put(path: string, body: any, json = true, contentType?: string): Promise<IRequestResult> {
    return this._makeRequest("PUT", path, body, json, contentType);
  }
  static async delete(path: string): Promise<IRequestResult> {
    return this._makeRequest("DELETE", path);
  }
  static _makeRequest(method: string, path: string, body?: any, json = false, contentType?: string): Promise<IRequestResult> {
    return new Promise<IRequestResult>((resolve, reject) => {
      if(path.indexOf("/") === 0) {
        //remove leading slash
        path = path.slice(1, path.length);
      }
      //TODO this default base url is not final
      let baseUrl = config.get("baseApiEndPoint") || 'https://hdvh2pvekj.execute-api.us-west-2.amazonaws.com/production/';
      let finalUrl = path.indexOf("http") !== -1 ? path : url.resolve(baseUrl, path);
      let headers = {
        "User-Agent": `${process.title}-cli`
      };
      let ApiKey = config.get("ApiKey");
      if(ApiKey) {
        headers["Authorization"] = `Bearer ${ApiKey}`;
      }
      if(contentType) {
        headers["Content-Type"] = contentType;
      }
      let req: request.Options = {
        method,
        headers,
        url: finalUrl,
        body,
        json
      };
      logger.debug(`[${method}]: ${finalUrl}`)
      request(req, (err: any, res: request.RequestResponse, body: any) => {
        if(res && res.headers["content-type"] === "application/json" && typeof body === "string" && body.length !== 0) {
          body = JSON.parse(body);
        }
        if(err) {
          logger.info(`Res from returned error ${method}:${finalUrl} => ${err}`)
          reject({
            error: body ? body.error ? body.error : body : err
          });
          return;
        } else {
          logger.info(`Res from ${method}:${finalUrl} => ${res.statusCode}`);
          if(res.statusCode >= 200 && res.statusCode < 400) {
            logger.info(`Res detected success from ${method}:${finalUrl} => content length ${body.length < 1000 ? body : body.length}`)
            return resolve({
              res,
              body
            });
          } else {
            logger.info(`Res detected error from ${method}:${finalUrl} => content length: ${body.length < 1000 ? body : body.length}`)
            return reject({
              res,
              body: body
            });
          }
        }
      });
    });
  }
}

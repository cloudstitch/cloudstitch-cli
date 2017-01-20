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
  static async post(path: string, body: any, json = true): Promise<IRequestResult> {
    return this._makeRequest("POST", path, body, json);
  }
  static async put(path: string, body: any, json = true): Promise<IRequestResult> {
    return this._makeRequest("PUT", path, body, json);
  }
  static async delete(path: string): Promise<IRequestResult> {
    return this._makeRequest("DELETE", path);
  }
  static _makeRequest(method: string, path: string, body?: any, json = false): Promise<IRequestResult> {
    return new Promise<IRequestResult>((resolve, reject) => {
      //TODO this default base url is not final
      let baseUrl = config.get("baseApiEndPoint") || 'https://api.cloudstitch.com/prod';
      let finalUrl = url.resolve(baseUrl, path);
      let headers = {
        "User-Agent": `${process.title}-cli`
      };
      let ApiKey = config.get("ApiKey");
      if(ApiKey) {
        headers["Authorization"] = `Bearer ${ApiKey}`;
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
        logger.info(`Res from ${method}:${finalUrl} => ${res.statusCode}`)
        if(err) {
          logger.info(`Res from returned error ${method}:${finalUrl} => ${err}`)
          reject({
            error: err
          });
          return;
        } else {
          if(res.statusCode >= 200 && res.statusCode < 400) {
            logger.info(`Res detected success from ${method}:${finalUrl} => ${body}`)
            if(res.headers["content-type"] === "application/json" && typeof body === "string") {
              body = JSON.parse(body);
            }
            resolve({
              res,
              body
            });
            return;
          } else {
            logger.info(`Res detected error from ${method}:${finalUrl} => ${body}`)
            reject({
              res,
              error: body.error
            });
            return;
          }
        }
      });
    });
  }
}

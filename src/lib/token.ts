
import { instance as config } from "./config";
import Request from "./request";
import { instance as logger } from "./logger";

export default function token(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let apiKey = config.get("ApiKey");
    logger.info(`Checking ApiKey: ${apiKey}`);
    if(!apiKey) {
      reject();
    }
    Request.get("/session").then((result) => {
      // This method call returns HTTP FORBIDDEN if we're not logged in.
      resolve();
    }, (result) => {
      reject();
    });
  });
}
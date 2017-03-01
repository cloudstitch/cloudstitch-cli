var chalk = require("chalk");
var timestamp = require("time-stamp");

import { instance as config } from "./config";

let colorMap = {
  "success": "green",
  "error": "red",
  "warn": "yellow",
  "info": "blue"
}

let levelMap = {
  "error": 0,
  "warn": 1,
  "success": 1,
  "debug": 2,
  "info": 3
};

let configLogLevel = config.get("logLevel");
if(!configLogLevel) {
  configLogLevel = "warn";
  config.set("logLevel", configLogLevel);
}

export class Logger {
  _log(level: string, message: any, func?: string) {
    if(levelMap[level] > levelMap[configLogLevel]) {
      return;
    }
    message = <any>message;
    while(typeof message !== "string" ) {
      message = message.message
        || message.Message
        || message.error
        || message.Error
        || JSON.stringify(message);
    }
    let levelMark = level !== "debug" ? chalk[colorMap[level]](`[${level}]`) : `[${level}]`;
    if(levelMap[configLogLevel] > levelMap["warn"]) {
      levelMark = `[${timestamp("HH:MM:ss:ms")}]${levelMark}`;
    }
    console[func || level](`${levelMark} ${message}`);
  }
  error(message) {
    this._log("error", message);
  }
  warn(message) {
    this._log("warn", message);
  }
  debug(message) {
    this._log("debug", message, "log");
  }
  info(message) {
    this._log("info", message);
  }
  success(message) {
    this._log("success", message, "log");
  }
  shouldSpin(): boolean {
    return levelMap[configLogLevel] <= 1;
  }

}

export let instance = new Logger();
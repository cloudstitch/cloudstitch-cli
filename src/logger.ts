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
  _log(level: string, message: string, func?: string) {
    if(levelMap[level] > levelMap[configLogLevel]) {
      return;
    }
    let levelMark = level !== "debug" ? chalk[colorMap[level]](`[${level}]`) : `[${level}]`;
    if(levelMap[configLogLevel] > levelMap["warn"]) {
      let now = new Date();
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

}

export let instance = new Logger();
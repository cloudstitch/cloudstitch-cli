/*
 * Simulates an IoT button click
 */
import * as path from "path";
import * as fs from "fs";

import * as Q from "q";

import { ICommand, ICommandOptions } from "./command";
import Request from "../lib/request";
import { instance as logger } from "../lib/logger";
import Button from "../lib/button";
import { instance as pkg } from "../lib/package";

const messageInvalidParam = () => {
  logger.error("The serial number does not appera to be valid");
  process.exit(1);
};

const messageProjectNotFound = (serial: string) => {
  logger.error(`The project ${serial} does not exist.`);
  process.exit(1);
};

const messageUnauthorized = (serial: string) => {
  logger.error(`You do not have permission to ${serial}.`);
  process.exit(1);
};

const messageError = (error: string) => {
  logger.error(`an error occured ${error}.`);
  process.exit(1);
};

class Buttonclick implements ICommand {
  doc = "buttonclick <SerialNumber> [--type SINGLE|DOUBLE|LONG]";
  requiresPkg = false;
  requiresLogin = true;

  async run(options: Object) {
    logger.info(`Detected app dir: ${appDir}`);
    await Button.buttonclick(serialNumber, options["--type"]);
    
    Project.pull(appDir, user, app, options["--force"]);
  }
}

export =  new Pull();

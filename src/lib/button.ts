import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

import * as Q from "q";

import Request, { IRequestResult } from "./request";
import { instance as logger } from "../lib/logger";
import { instance as config } from "../lib/config";
import * as utils from "../lib/utils";

import IProjectDetails from "./project";


type ClickType = "SINGLE" | "DOUBLE" | "LONG";
type ButtonKind = "MAGIC" | "CHARITY";

interface IClickRequest {
  clickType: ClickType;
  simulated: true
}

export default class Button {
  /*
   * Simulates a button click.
   */
  static async buttonclick(serial: string, clickType: ClickType = "SINGLE"): Promise<string> {
    let req : IClickRequest = {
      clickType: clickType,
      simulated: true
    }

    let res: IRequestResult;
    try {
      res = await Request.post(`/button/${serial}/push`, req);
    } catch(e) {
      throw new Error("Push Error: " + e.message);
    }

    return "Button pushed."
  }
}
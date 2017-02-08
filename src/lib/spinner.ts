import { Spinner as CliSpinner } from "cli-spinner"

import { instance as logger } from "./logger";

export default class Spinner {
  spinner: CliSpinner;
  constructor() {
    this.spinner = new CliSpinner("Working ...");
    this.spinner.setSpinnerString(18);
  }
  start() {
    if(logger.shouldSpin()) {
      this.spinner.start();
    }
  }
  stop() {
    if(logger.shouldSpin()) {
      this.spinner.stop();
      console.log("");
    }
  }
}
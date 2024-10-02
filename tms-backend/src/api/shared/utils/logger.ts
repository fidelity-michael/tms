export class Logger {
  private static instance: Logger;

  constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log = (message: string, ...args: any[]) => {
    const colorCode = "37m"; // white
    this.helper(message, colorCode, args);
  };

  public error = (message: string, ...args: any[]) => {
    const colorCode = "31m"; // red
    this.helper(message, colorCode, args);
  };

  public debug = (message: string, ...args: any[]) => {
    const colorCode = "33m"; // yellow
    this.helper(message, colorCode, args);
  };

  public success = (message: string, ...args: any[]) => {
    const colorCode = "32m"; // green
    this.helper(message, colorCode, args);
  };

  helper(message: string, colorCode: string, ...args: any[]) {
    console.log(
      `\x1b[${colorCode}${this.getDate()}> ${message} ${args}\x1b[0m`,
    );
  }

  getDate = () => {
    return new Date().toLocaleString("en-US", { timeZone: "Europe/Helsinki" });
  };
}

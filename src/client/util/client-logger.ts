import { ILogger } from "../../common/interface/logger.interface";

export const clientLogger: ILogger = {
  debug(message) { console.debug(message); },
  warn(message) { console.warn(message); },
  error(message) { console.error(message); },
  info(message) { console.info(message); },
}
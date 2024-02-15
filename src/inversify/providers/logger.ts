import { createLogger, format, transports } from "winston";
export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    format.json(),
  ),

  transports: [new transports.Console()],
});

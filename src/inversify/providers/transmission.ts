import Transmission from "transmission-promise";
import { interfaces } from "inversify";
import { TYPES } from "../types";
import { ConfigType } from "../../config";
import { Logger } from "winston";

export const transmission = (context: interfaces.Context) => {
  const { transmission } = context.container.get<ConfigType>(TYPES.Config);
  const logger = context.container.get<Logger>(TYPES.Logger);

  if (transmission.host === undefined) {
    logger.verbose(
      "Not initializing TransmissionProvider because 'TRANSMISSION_HOST' environment variable is not set",
    );
    return undefined;
  }

  logger.info("Initializing Transmission RPC client");
  return new Transmission(transmission);
};

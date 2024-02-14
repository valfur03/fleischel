import {
  initContainer,
  ContainerInitializationOptions,
} from "./inversify/init-container";
import { TYPES } from "./inversify/types";
import { Container } from "inversify";
import { Logger } from "winston";

function watch(container: Container) {
  return async () => {
    const logger = container.get<Logger>(TYPES.Logger);

    logger.info("Starting service");
  };
}

export function createService(options: ContainerInitializationOptions) {
  const container = initContainer(options);

  return { watch: watch(container) };
}

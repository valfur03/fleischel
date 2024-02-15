import {
  initContainer,
  ContainerInitializationOptions,
} from "./inversify/init-container";
import { TYPES } from "./inversify/types";
import { Container } from "inversify";
import { Logger } from "winston";
import { initJobs } from "./jobs";
import { CronJob } from "cron";

function watch(container: Container, jobs: Array<CronJob>) {
  return async () => {
    const logger = container.get<Logger>(TYPES.Logger);

    logger.info("Starting service");

    jobs.forEach((job) => {
      job.start();
    });
  };
}

export function createService(options: ContainerInitializationOptions) {
  const container = initContainer(options);
  const jobs = initJobs(container);

  return { watch: watch(container, jobs) };
}

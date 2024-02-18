import {
  initContainer,
  ContainerInitializationOptions,
} from "./inversify/init-container";
import { TYPES } from "./inversify/types";
import { Container } from "inversify";
import { Logger } from "winston";
import { CronJob } from "cron";
import { JobsFactory } from "./JobsFactory/jobs.factory";

function watch(
  container: Container,
  jobs: Array<CronJob<null, CronJob<null, null>>>,
) {
  return async () => {
    const logger = container.get<Logger>(TYPES.Logger);

    logger.info("Starting service");

    jobs.forEach((job) => {
      job.start();
    });
  };
}

function stop(
  container: Container,
  jobs: Array<CronJob<null, CronJob<null, null>>>,
) {
  return async () => {
    const logger = container.get<Logger>(TYPES.Logger);

    logger.info("Stopping service");

    jobs.forEach((job) => {
      job.stop();
    });
  };
}

export function createService(options: ContainerInitializationOptions) {
  const container = initContainer(options);
  const jobsFactory = container.get<JobsFactory>(JobsFactory);
  const jobs = jobsFactory.initJobs();

  return { watch: watch(container, jobs), stop: stop(container, jobs) };
}

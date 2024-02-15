import {
  initContainer,
  ContainerInitializationOptions,
} from "./inversify/init-container";
import { TYPES } from "./inversify/types";
import { Container } from "inversify";
import { Logger } from "winston";
import { ArchLinuxProvider } from "./ArchLinuxProvider/arch-linux.provider";
import { TransmissionAdapter } from "./TransmissionAdapter/transmission.adapter";
import { CronJob } from "cron";
import { Provider } from "./common/interfaces/provider";
import { Adapter } from "./common/interfaces/adapter";

function watch(container: Container) {
  return async () => {
    const logger = container.get<Logger>(TYPES.Logger);

    logger.info("Starting service");
    const archLinuxProvider = container.get<Provider>(ArchLinuxProvider);
    const transmissionAdapter = container.get<Adapter>(TransmissionAdapter);

    const cron = await archLinuxProvider.getCron();
    const job = CronJob.from({
      cronTime: typeof cron === "string" ? cron : cron.cronTime,
      runOnInit: true,
      onTick: async () => {
        const torrent = await archLinuxProvider.getLatestTorrent();
        await transmissionAdapter.addTorrent(torrent);
      },
      timeZone: typeof cron !== "string" ? cron.timeZone : undefined,
    });
    job.start();
  };
}

export function createService(options: ContainerInitializationOptions) {
  const container = initContainer(options);

  return { watch: watch(container) };
}

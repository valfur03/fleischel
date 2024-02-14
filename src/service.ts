import {
  initContainer,
  ContainerInitializationOptions,
} from "./inversify/init-container";
import { TYPES } from "./inversify/types";
import { Container } from "inversify";
import { Logger } from "winston";
import { ArchLinuxProvider } from "./ArchLinuxProvider/arch-linux.provider";
import { TransmissionAdapter } from "./TransmissionAdapter/transmission.adapter";

function watch(container: Container) {
  return async () => {
    const logger = container.get<Logger>(TYPES.Logger);

    logger.info("Starting service");
    const archLinuxProvider = container.get(ArchLinuxProvider);
    const transmissionAdapter = container.get(TransmissionAdapter);
    const torrent = await archLinuxProvider.getLatestTorrent();
    await transmissionAdapter.addTorrent(torrent);
  };
}

export function createService(options: ContainerInitializationOptions) {
  const container = initContainer(options);

  return { watch: watch(container) };
}

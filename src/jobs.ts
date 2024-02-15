import { Provider } from "./common/interfaces/provider";
import { ArchLinuxProvider } from "./ArchLinuxProvider/arch-linux.provider";
import { Adapter } from "./common/interfaces/adapter";
import { TransmissionAdapter } from "./TransmissionAdapter/transmission.adapter";
import { CronJob } from "cron";
import { Container } from "inversify";

export function initJobs(container: Container) {
  const archLinuxProvider = container.get<Provider>(ArchLinuxProvider);
  const transmissionAdapter = container.get<Adapter>(TransmissionAdapter);

  const cron = archLinuxProvider.getCron();
  return [
    CronJob.from({
      cronTime: typeof cron === "string" ? cron : cron.cronTime,
      runOnInit: true,
      onTick: async () => {
        const torrent = await archLinuxProvider.getLatestTorrent();
        await transmissionAdapter.addTorrent(torrent);
      },
      timeZone: typeof cron !== "string" ? cron.timeZone : undefined,
    }),
  ];
}

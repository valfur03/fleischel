import { inject, injectable } from "inversify";
import { ArchLinuxProvider } from "../ArchLinuxProvider/arch-linux.provider";
import { Provider } from "../common/interfaces/provider";
import { Adapter } from "../common/interfaces/adapter";
import { TransmissionAdapter } from "../TransmissionAdapter/transmission.adapter";
import { CronJob } from "cron";

@injectable()
export class JobsFactory {
  constructor(
    @inject(ArchLinuxProvider) private readonly archLinuxProvider: Provider,
    @inject(TransmissionAdapter) private readonly transmissionAdapter: Adapter,
  ) {}

  initJobs() {
    const cron = this.archLinuxProvider.getCron();
    return [
      CronJob.from({
        cronTime: typeof cron === "string" ? cron : cron.cronTime,
        runOnInit: true,
        onTick: async () => {
          const torrent = await this.archLinuxProvider.getLatestTorrent();
          await this.transmissionAdapter.addTorrent(torrent);
        },
        timeZone: typeof cron !== "string" ? cron.timeZone : undefined,
      }),
    ];
  }
}

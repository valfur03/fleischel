import { Container, inject, injectable, interfaces } from "inversify";
import { ArchLinuxProvider } from "../ArchLinuxProvider/arch-linux.provider";
import { Provider } from "../common/interfaces/provider";
import { TransmissionAdapter } from "../TransmissionAdapter/transmission.adapter";
import { CronJob } from "cron";
import { Adapter } from "../common/interfaces/adapter";
import { TYPES } from "../inversify/types";
import winston, { Logger } from "winston";
import { ConfigType } from "../config";

type JobFn = () => Promise<void>;

@injectable()
export class JobsFactory {
  private readonly logger: winston.Logger;
  private readonly providersSymbol = [ArchLinuxProvider];
  private readonly adaptersSymbol: Array<
    interfaces.ServiceIdentifier<Adapter>
  > = [TransmissionAdapter];

  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.Config) private readonly config: ConfigType,
  ) {
    this.logger = logger.child({ service: "Jobs" });
  }

  runJob(job: JobFn) {
    return async function (this: CronJob) {
      await job();
    };
  }

  bindCronJobToProvider(provider: Provider, job: JobFn) {
    const cron = provider.getCron();

    this.logger.verbose(
      `The provider's cron job string is '${typeof cron === "string" ? cron : cron.cronTime}'`,
    );

    return CronJob.from({
      cronTime: typeof cron === "string" ? cron : cron.cronTime,
      runOnInit: true,
      onTick: this.runJob(job),
      timeZone: typeof cron !== "string" ? cron.timeZone : undefined,
    });
  }

  createCronJob(
    container: Container,
    providerSymbol: interfaces.ServiceIdentifier<Provider>,
  ) {
    const adapters = this.adaptersSymbol.map((adapter) =>
      container.get<Adapter>(adapter),
    );
    const provider = container.get<Provider>(providerSymbol);

    return this.bindCronJobToProvider(provider, async () => {
      const torrent = await provider.getLatestTorrent();
      const addTorrentPromises = adapters.map((adapter) =>
        adapter.addTorrent(torrent),
      );
      await Promise.all(addTorrentPromises);
    });
  }

  initJobs(container: Container) {
    return this.providersSymbol.map((provider) =>
      this.createCronJob(container, provider),
    );
  }
}

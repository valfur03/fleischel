import { Container, inject, injectable, interfaces } from "inversify";
import { ArchLinuxProvider } from "../ArchLinuxProvider/arch-linux.provider";
import { Provider } from "../common/interfaces/provider";
import { TransmissionAdapter } from "../TransmissionAdapter/transmission.adapter";
import { CronJob } from "cron";
import { Adapter } from "../common/interfaces/adapter";
import { TYPES } from "../inversify/types";
import winston, { Logger } from "winston";
import { ConfigType } from "../config";
import { DateTime } from "luxon";
import { TorrentsHistoryService } from "../TorrentsHistory/torrents-history.service";

type JobFn = (retryLater: () => void) => Promise<void>;

@injectable()
export class JobsFactory {
  private readonly logger: winston.Logger;
  private readonly providersSymbol = [ArchLinuxProvider];
  private readonly adaptersSymbol: Array<
    interfaces.ServiceIdentifier<Adapter>
  > = [TransmissionAdapter];

  constructor(
    @inject(TorrentsHistoryService)
    private readonly torrentsHistoryService: TorrentsHistoryService,
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.Config) private readonly config: ConfigType,
  ) {
    this.logger = logger.child({ service: "Jobs" });
  }

  runJob(job: JobFn) {
    const retryLater = (cronJob: CronJob) => {
      return () => {
        if (
          cronJob.nextDate().toJSDate() >
          DateTime.now()
            .plus({ millisecond: this.config.unchangedTorrentRetryTime })
            .toJSDate()
        ) {
          this.logger.info(
            `The job will be retried in ${this.config.unchangedTorrentRetryTime}ms`,
          );
          setTimeout(
            this.runJob(job).bind(cronJob),
            this.config.unchangedTorrentRetryTime,
          );
        } else {
          this.logger.info(
            "This job will be triggered soon by scheduler, no need to retry",
          );
        }
      };
    };

    return async function (this: CronJob) {
      await job(retryLater(this));
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

    return this.bindCronJobToProvider(provider, async (retryLater) => {
      const torrent = await provider.getLatestTorrent();
      if (this.torrentsHistoryService.getLatest(providerSymbol) === torrent) {
        // TODO not precise, provider's name missing
        this.logger.info(`Latest fetched torrent for provider has not changed`);
        return retryLater();
      }
      this.torrentsHistoryService.setLatest(providerSymbol, torrent);
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

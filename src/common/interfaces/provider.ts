import { CronJobParams } from "cron";

export interface Provider {
  getLatestTorrent(): Promise<string>;

  getCron(): string | Pick<CronJobParams, "cronTime" | "timeZone">;
}

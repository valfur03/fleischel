import { inject, injectable } from "inversify";
import { TYPES } from "../inversify/types";
import winston from "winston";
import RssParser from "rss-parser";
import { Provider } from "../common/interfaces/provider";

@injectable()
export class ArchLinuxProvider implements Provider {
  private readonly logger: winston.Logger;
  private readonly rssFeedUrl = "https://archlinux.org/feeds/releases";

  constructor(
    @inject(TYPES.Logger) logger: winston.Logger,
    @inject(TYPES.RssParser) private readonly rssParser: RssParser,
  ) {
    this.logger = logger.child({ provider: "Arch" });
  }

  private async fetchRssFeed() {
    this.logger.verbose(`Fetching RSS feed at URL '${this.rssFeedUrl}'`);
    const xmlRssFeed = await fetch(this.rssFeedUrl).then((res) => {
      if (!res.ok) {
        this.logger.verbose(
          `The received response is not successful (${res.status} ${res.statusText})`,
        );
        throw new Error("An error occurred while fetching the RSS feed");
      }
      return res.text();
    });
    this.logger.verbose("The RSS feed has been fetched successfully", {
      content: xmlRssFeed,
    });
    return this.rssParser.parseString(xmlRssFeed);
  }

  async getLatestTorrent() {
    this.logger.verbose("Getting latest torrent");
    const rssFeed = await this.fetchRssFeed();

    if (rssFeed.items.length < 1) {
      this.logger.verbose("The RSS feed did not return enough items");
      throw new Error("Cannot find a suitable release from the RSS feed");
    }

    const torrentUrl = `${rssFeed.items[0].link}torrent`;
    this.logger.verbose(`Got '${torrentUrl}' as the latest torrent's URL`);
    return torrentUrl;
  }

  getCron() {
    return { cronTime: "0 0 0 1 * *", timeZone: "Europe/Paris" };
  }
}

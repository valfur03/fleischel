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
    return this.rssParser.parseString(
      '<?xml version="1.0" encoding="utf-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Arch Linux: Releases</title><link>https://archlinux.org/download/</link><description>Release ISOs</description><atom:link href="https://archlinux.org/feeds/releases/" rel="self"/><language>en-us</language><lastBuildDate>Thu, 01 Feb 2024 12:20:14 +0000</lastBuildDate><item><title>2024.02.01</title><link>https://archlinux.org/releng/releases/2024.02.01/</link><description/><pubDate>Thu, 01 Feb 2024 00:00:00 +0000</pubDate><guid isPermaLink="false">tag:archlinux.org,2024-02-01:/releng/releases/2024.02.01/</guid><enclosure length="977612800" type="application/x-bittorrent" url="https://archlinux.org//releng/releases/2024.02.01/torrent/"/></item><item><title>2024.01.01</title><link>https://archlinux.org/releng/releases/2024.01.01/</link><description/><pubDate>Mon, 01 Jan 2024 00:00:00 +0000</pubDate><guid isPermaLink="false">tag:archlinux.org,2024-01-01:/releng/releases/2024.01.01/</guid><enclosure length="926232576" type="application/x-bittorrent" url="https://archlinux.org//releng/releases/2024.01.01/torrent/"/></item><item><title>2023.12.01</title><link>https://archlinux.org/releng/releases/2023.12.01/</link><description/><pubDate>Fri, 01 Dec 2023 00:00:00 +0000</pubDate><guid isPermaLink="false">tag:archlinux.org,2023-12-01:/releng/releases/2023.12.01/</guid><enclosure length="914698240" type="application/x-bittorrent" url="https://archlinux.org//releng/releases/2023.12.01/torrent/"/></item></channel></rss>',
    );
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
    return { cronTime: "*/5 * * * * *", timeZone: "Europe/Paris" };
    return { cronTime: "0 0 0 1 * *", timeZone: "Europe/Paris" };
  }
}

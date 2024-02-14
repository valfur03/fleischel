import { inject, injectable, optional } from "inversify";
import { Adapter } from "../common/interfaces/adapter";
import { TYPES } from "../inversify/types";
import winston from "winston";
import Transmission from "transmission-promise";

@injectable()
export class TransmissionAdapter implements Adapter {
  private readonly logger: winston.Logger;

  constructor(
    @inject(TYPES.Logger) logger: winston.Logger,
    @inject(TYPES.Transmission)
    @optional()
    private readonly transmission: Transmission | undefined,
  ) {
    this.logger = logger.child({ adapter: "Transmission" });
  }

  async addTorrent(torrent: string) {
    if (this.transmission === undefined) return;

    this.logger.verbose(`Adding torrent from URL '${torrent}'`);
    await this.transmission.addUrl(torrent);
  }
}

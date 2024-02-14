#!/usr/bin/env node

import "reflect-metadata";
import { TYPES } from "./inversify/types";
import { logger } from "./inversify/providers/logger";
import { rssParser } from "./inversify/providers/rss-parser";
import { config } from "./config";
import { transmission } from "./inversify/providers/transmission";
import { ArchLinuxProvider } from "./ArchLinuxProvider/arch-linux.provider";
import { TransmissionAdapter } from "./TransmissionAdapter/transmission.adapter";
import { createService } from "./service";

async function main() {
  const service = createService({
    providers: [
      ArchLinuxProvider,
      TransmissionAdapter,
      { provide: TYPES.Logger, useValue: logger },
      { provide: TYPES.RssParser, useValue: rssParser },
      { provide: TYPES.Config, useValue: config },
      { provide: TYPES.Transmission, useFactory: transmission },
    ],
  });
  await service.watch();
}

main();

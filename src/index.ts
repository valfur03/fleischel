#!/usr/bin/env node

import "reflect-metadata";
import { TYPES } from "./inversify/types";
import { logger } from "./inversify/providers/logger";
import { rssParser } from "./inversify/providers/rss-parser";
import { createService } from "./service";

async function main() {
  const service = createService({
    providers: [
      { provide: TYPES.Logger, useValue: logger },
      { provide: TYPES.RssParser, useValue: rssParser },
    ],
  });
  await service.watch();
}

main();

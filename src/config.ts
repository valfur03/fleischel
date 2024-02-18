function parseIntWithDefault(string: string | undefined, defaultValue: number) {
  return string === undefined ? defaultValue : parseInt(string);
}

export const config = {
  unchangedTorrentRetryTime: parseIntWithDefault(
    process.env.UNCHANGED_TORRENT_RETRY_TIME,
    1000 * 60 * 60,
  ),
  transmission: {
    host: process.env.TRANSMISSION_HOST,
    port: process.env.TRANSMISSION_PORT || 9091,
    username: process.env.TRANSMISSION_USER,
    password: process.env.TRANSMISSION_PASS,
    ssl: process.env.TRANSMISSION_SSL || false,
    url: process.env.TRANSMISSION_URL || "/transmission/rpc",
  },
};

export type ConfigType = typeof config;

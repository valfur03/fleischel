export const config = {
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

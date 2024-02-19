# Fleischel

> Automatically leech latest Linux's ISO torrents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Usage

Fleischel obviously works best with one or more BitTorrent clients. See more at [Configuration](#configuration).

### With Docker

```shell
docker run ghcr.io/valfur03/fleischel:latest
```

### With Compose

```yaml
services:
  fleischel:
    image: ghcr.io/valfur03/fleischel
    networks:
      - torrents
    restart: unless-stopped
```

## Configuration

Fleischel aims to be as modular as possible. You can configure its behavior at runtime using environment variables.

### General

| Environment variable           | Default value      | Description                                                                          |
|--------------------------------|--------------------|--------------------------------------------------------------------------------------|
| `UNCHANGED_TORRENT_RETRY_TIME` | `3600000` (1 hour) | The time (in ms) to wait before retrying a download when the release has not changed |

### BitTorrent clients

> [!IMPORTANT]
> In order to enable clients, some variable must be set (in general, this is the hostname). This will be variables marked with **Required to enable**.

| Environment variable | Default value       | Description                                                                  |
|----------------------|---------------------|------------------------------------------------------------------------------|
| `TRANSMISSION_HOST`  | —                   | **Required to enable** – The host of the Transmission RPC (e.g. `localhost`) |
| `TRANSMISSION_PORT`  | `9091`              | The port on which the Transmission RPC is listening for connections          |
| `TRANSMISSION_USER`  | —                   | The username to connect to the Transmission RPC                              |
| `TRANSMISSION_PASS`  | —                   | The password to connect to the Transmission RPC                              |
| `TRANSMISSION_SSL`   | `false`             | Whether or not to enable SSL connection to the Transmission RPC              |
| `TRANSMISSION_URL`   | `/transmission/rpc` | The URL on which the Transmission RPC is exposed                             |

## License

This software is licensed under the [MIT](https://github.com/valfur03/fleischel/blob/master/LICENSE) ©.

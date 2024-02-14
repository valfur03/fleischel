export interface Provider {
  getLatestTorrent(): Promise<string>;
}

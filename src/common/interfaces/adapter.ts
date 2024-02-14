export interface Adapter {
  addTorrent(torrent: string): Promise<void>;
}

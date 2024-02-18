import { injectable, interfaces } from "inversify";
import { Provider } from "../common/interfaces/provider";

@injectable()
export class TorrentsHistoryService {
  private readonly history: Map<
    interfaces.ServiceIdentifier<Provider>,
    string
  > = new Map();

  getLatest(key: interfaces.ServiceIdentifier<Provider>) {
    return this.history.get(key);
  }

  setLatest(key: interfaces.ServiceIdentifier<Provider>, torrent: string) {
    this.history.set(key, torrent);
  }
}

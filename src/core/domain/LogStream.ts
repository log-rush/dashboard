import { ConnectionStatus } from '../model/dataSource';
import { LogStreamRecord } from '../model/logStream';
import { DataSource } from './DataSource';

export class LogStream implements LogStreamRecord {
  private _isSubscribed = false;
  private _isCached = false;
  private _connectionStatus: ConnectionStatus = 'disconnected';

  get isSubscribed(): boolean {
    return this._isSubscribed;
  }

  get isCached(): boolean {
    return this._isCached;
  }

  get status(): ConnectionStatus {
    return this._connectionStatus;
  }

  get dataSource(): string {
    return this._dataSource.id;
  }

  private constructor(
    public readonly id: string,
    public readonly alias: string,
    private readonly _dataSource: DataSource,
  ) {}

  public static async create(
    dataSource: DataSource,
    id: string,
  ): Promise<LogStream | undefined> {
    const data = await dataSource.getStream(id);
    if (data) {
      return new LogStream(data.id, data.alias, dataSource);
    }
    return undefined;
  }

  public subscribe() {
    if (!this._isSubscribed) {
      this._dataSource.subscribe(this.id);
    }
  }

  public unsubscribe() {
    if (this._isSubscribed) {
      this._dataSource.unsubscribe(this.id);
    }
  }
}

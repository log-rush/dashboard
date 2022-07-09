import { ConnectionStatus } from '../model/dataSource';
import { LogStreamRecord, StoredLogStream } from '../model/logStream';
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
    return this._dataSource?.id ?? '__none__';
  }

  private constructor(
    public readonly id: string,
    public readonly alias: string,
    private readonly _dataSource?: DataSource,
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

  public static async createFromCache(
    data: StoredLogStream,
  ): Promise<LogStream | undefined> {
    const stream = new LogStream(data.id, data.alias, undefined);
    stream._isCached = true;
    return stream;
  }

  public subscribe() {
    if (!this._isSubscribed && this._dataSource) {
      this._dataSource.subscribe(this.id);
      this._isSubscribed = true;
    }
  }

  public unsubscribe() {
    if (this._isSubscribed && this._dataSource) {
      this._dataSource.unsubscribe(this.id);
      this._isSubscribed = false;
    }
  }

  public async revokeCacheStatus(
    dataSource: DataSource,
  ): Promise<LogStream | undefined> {
    const stream = await LogStream.create(dataSource, this.id);
    if (stream) {
      stream.subscribe();
      return stream;
    }
    return undefined;
  }

  public subscribeTemporary(): () => void {
    if (!this._isSubscribed && this._dataSource) {
      this._dataSource.subscribe(this.id);
    }
    return () => {
      if (!this._isSubscribed && this._dataSource) {
        this._dataSource.unsubscribe(this.id);
      }
    };
  }
}

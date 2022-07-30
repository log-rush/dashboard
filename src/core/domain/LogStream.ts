import { UnwrapNestedRefs } from 'vue';
import { ConnectionStatus } from '../model/dataSource';
import { RecordAble, StorageRecordAble } from '../model/helper';
import { LogStreamRecord, StoredLogStream } from '../model/logStream';
import { DataSource } from './DataSource';

export class LogStream
  implements RecordAble<LogStreamRecord>, StorageRecordAble<StoredLogStream>
{
  private _isSubscribed = false;
  private _connectionStatus: ConnectionStatus = 'disconnected';

  get isSubscribed(): boolean {
    return this._isSubscribed;
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
    private readonly _dataSource?: DataSource | UnwrapNestedRefs<DataSource>,
  ) {}

  public static async create(
    dataSource: DataSource | UnwrapNestedRefs<DataSource>,
    id: string,
  ): Promise<LogStream | undefined> {
    const data = await dataSource.getStream(id);
    if (data) {
      const stream = new LogStream(data.id, data.alias, dataSource);
      stream._connectionStatus = 'available';
      return stream;
    }
    return undefined;
  }

  // public static async createFromCache(
  //   data: StoredLogStream,
  // ): Promise<LogStream | undefined> {
  //   const stream = new LogStream(data.id, data.alias, undefined);
  //   stream._connectionStatus = 'disconnected';
  //   // TODO: restore cached
  //   return stream;
  // }

  public subscribe() {
    if (!this._isSubscribed && this._dataSource) {
      this._dataSource.subscribe(this.id);
      this._connectionStatus = 'connected';
      this._isSubscribed = true;
    }
  }

  public unsubscribe() {
    if (this._isSubscribed && this._dataSource) {
      this._dataSource.unsubscribe(this.id);
      this._connectionStatus = 'available';
      this._isSubscribed = false;
    }
  }

  public async revokeCacheStatus(
    dataSource: DataSource | UnwrapNestedRefs<DataSource>,
  ): Promise<LogStream | undefined> {
    const stream = await LogStream.create(dataSource, this.id);
    if (stream) {
      stream.subscribe();
      return stream;
    }
    return undefined;
  }

  public subscribeTemporary(): () => boolean {
    if (!this._isSubscribed && this._dataSource) {
      this._dataSource.subscribe(this.id);
    }
    return () => {
      if (!this._isSubscribed && this._dataSource) {
        this._dataSource.unsubscribe(this.id);
        return true;
      }
      return false;
    };
  }

  public toRecord(): LogStreamRecord {
    return {
      id: this.id,
      alias: this.alias,
      dataSource: this.dataSource,
      isSubscribed: this._isSubscribed,
      status: this.status,
    };
  }

  public toStorageRecord(): StoredLogStream {
    return {
      id: this.id,
      alias: this.alias,
      dataSource: this.dataSource,
    };
  }
}

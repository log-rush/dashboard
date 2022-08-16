import {
  ConnectionStatus,
  DataSourceRecord,
  StoredDataSource,
} from '@/core/model/dataSource';
import { DataSourceConnection } from '@/core/services/DataSourceConnection';
import { LogStreamResponse } from '@/core/model/api/httpTypes';
import { InjectionKey, Injector } from '@/core/Injector';
import { LogRecord } from '@/core/model/log';
import { RecordAble, StorageRecordAble } from '../model/helper';

interface DataSourceUpdateHandler {
  onLog(stream: string, log: LogRecord): void;
}

export class DataSource
  implements RecordAble<DataSourceRecord>, StorageRecordAble<StoredDataSource>
{
  private _connection: DataSourceConnection | undefined = undefined;
  private _updateHandler: DataSourceUpdateHandler;
  private _connectionStatus: ConnectionStatus = 'disconnected';

  public get id(): string {
    return this._id;
  }

  public get url(): string {
    return this._url;
  }

  public get name(): string {
    return this._name;
  }

  public get version(): string {
    return this._version;
  }

  public get status(): ConnectionStatus {
    return this._connectionStatus;
  }

  public get autoConnect(): boolean {
    return this._autoConnect;
  }

  private constructor(
    private _id: string,
    private _url: string,
    private _name: string,
    private _version: string,
    private _autoConnect: boolean,
  ) {
    this._updateHandler = {
      onLog() {
        return;
      },
    };
  }

  static async create(url: string): Promise<DataSource | undefined> {
    const data = await Injector.get(
      InjectionKey.DataSourcesService,
    ).getDataSource(url);
    if (data) {
      const ds = new DataSource(data.id, url, data.name, data.version, false);
      ds._connectionStatus = 'available';
      return ds;
    }
    return undefined;
  }

  static async createFromCache(
    data: StoredDataSource,
    handler: DataSourceUpdateHandler,
  ): Promise<DataSource> {
    console.log(data);
    const ds = new DataSource(
      data.id,
      data.url,
      data.name,
      data.version,
      data.autoConnect,
    );
    ds._connectionStatus = 'disconnected';
    const newData = await Injector.get(
      InjectionKey.DataSourcesService,
    ).getDataSource(data.url);
    if (newData) {
      ds._id = newData.id;
      ds._name = newData.name;
      ds._version = newData.version;
      ds._connectionStatus = 'available';
    }
    if (ds.autoConnect) {
      ds.connect(handler);
    }
    return ds;
  }

  public connect(handler: DataSourceUpdateHandler) {
    this._updateHandler = handler;
    if (!this._connection) {
      this._connection = new DataSourceConnection(
        this.id,
        this.url.split('://')[1],
      );
    }
    this._connection.setLogHandler(handler.onLog);
    this._connection.setStatusUpdateHandler((status) => {
      this._connectionStatus = status;
    });
  }

  public disconnect() {
    if (this._connection) {
      this._connection.close();
      this._connection = undefined;
    }
  }

  public reconnect() {
    if (this._connection) {
      this._connection.tryReConnect();
    }
  }

  public async listStreams(): Promise<LogStreamResponse[]> {
    return await Injector.get(InjectionKey.DataSourcesService).getStreams(
      this.url,
    );
  }

  public async getStream(id: string): Promise<LogStreamResponse | undefined> {
    return await Injector.get(InjectionKey.LogStreamsService).getStream(
      this.url,
      id,
    );
  }

  public subscribe(streamId: string) {
    if (this._connection) {
      this._connection.subscribe(streamId);
    }
  }

  public unsubscribe(streamId: string) {
    if (this._connection) {
      this._connection.unsubscribe(streamId);
    }
  }

  public setAutoConnect(enabled: boolean) {
    this._autoConnect = enabled;
  }

  toRecord(): DataSourceRecord {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      url: this.url,
      version: this.version,
      autoConnect: this.autoConnect,
    };
  }

  toStorageRecord(): StoredDataSource {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      version: this.version,
      autoConnect: this.autoConnect,
    };
  }
}

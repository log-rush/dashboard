import {
  ConnectionStatus,
  DataSourceRecord,
  StoredDataSource,
} from '@/core/model/dataSource';
import { DataSourceConnection } from '@/core/services/DataSourceConnection';
import { LogStreamResponse } from '@/core/model/api/httpTypes';
import { LogRecord } from '@/core/model/log';
import { RecordAble, StorageRecordAble } from '../model/helper';
import { DataSourcesHttpService } from '../services/DataSourceService';
import { LogStreamsHttpService } from '../services/LogStreamsService';
import { noop } from '../adapter/util/helper';

interface DataSourceUpdateHandler {
  onLog?(stream: string, log: LogRecord): void;
  onStatusUpdate?(status: ConnectionStatus): void;
}

export class DataSource
  implements RecordAble<DataSourceRecord>, StorageRecordAble<StoredDataSource>
{
  private _connection: DataSourceConnection | undefined = undefined;
  private _updateHandler: DataSourceUpdateHandler;
  public status: ConnectionStatus = 'disconnected';

  private constructor(
    public id: string,
    public url: string,
    public name: string,
    public version: string,
    public autoConnect: boolean,
  ) {
    this._updateHandler = {
      onLog() {
        return;
      },
    };
  }

  static async create(url: string): Promise<DataSource | undefined> {
    const data = await DataSourcesHttpService.getDataSource(url);
    if (data) {
      const ds = new DataSource(data.id, url, data.name, data.version, false);
      ds.status = 'available';
      return ds;
    }
    return undefined;
  }

  static async createFromCache(
    data: StoredDataSource,
    handler: DataSourceUpdateHandler,
  ): Promise<DataSource> {
    const ds = new DataSource(
      data.id,
      data.url,
      data.name,
      data.version,
      data.autoConnect,
    );
    ds.status = 'disconnected';
    const newData = await DataSourcesHttpService.getDataSource(data.url);
    if (newData) {
      // dont update id -> breaks store
      ds.name = newData.name;
      ds.version = newData.version;
      ds.status = 'available';
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
    this._connection.setLogHandler(handler.onLog ?? noop);
    this._connection.setStatusUpdateHandler(
      handler.onStatusUpdate ??
        ((status) => {
          // fallback (is not reactive)
          this.status = status;
        }),
    );
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
    return await DataSourcesHttpService.getStreams(this.url);
  }

  public async getStream(id: string): Promise<LogStreamResponse | undefined> {
    return await LogStreamsHttpService.getStream(this.url, id);
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

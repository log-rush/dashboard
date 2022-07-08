import { ConnectionStatus, DataSourceInterface } from '../model/dataSource';
import { Log } from '../model/log';
import { DataSourceConnection } from '../services/DataSourceConnection';
import { DataSourcesService } from '../services/dataSourceService';

interface DataSourceUpdateHandler {
  onLog(stream: string, log: Log): void;
  onStatus(status: ConnectionStatus): void;
}

export class DataSource implements DataSourceInterface {
  private _connection: DataSourceConnection | undefined = undefined;
  private updateHandler: DataSourceUpdateHandler;
  private _connectionStatus: ConnectionStatus = 'disconnected';

  get status(): ConnectionStatus {
    return this._connectionStatus;
  }

  private constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly name: string,
    public readonly version: string,
  ) {
    this.updateHandler = {
      onLog() {
        return;
      },
      onStatus() {
        return;
      },
    };
  }

  static async create(url: string): Promise<DataSource | undefined> {
    const data = await DataSourcesService.getDataSource(url);
    if (data) {
      return new DataSource(data.id, url, data.name, data.version);
    }
    return undefined;
  }

  public connect(handler: DataSourceUpdateHandler) {
    this.updateHandler = handler;
    if (!this._connection) {
      this._connection = new DataSourceConnection(
        this.id,
        this.url.split('://')[1],
      );
    }
    this._connection.setLogHandler(handler.onLog);
    this._connection.setStatusUpdateHandler(handler.onStatus);
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
}

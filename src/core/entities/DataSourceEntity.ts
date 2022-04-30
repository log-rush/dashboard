import { Socket } from '../api/ws/socket';

export class DataSourceEntity {
  private reconnectTimeout = 3_000;
  private maxRetryAttempts = 10;

  private connection: Socket;
  private _isConnected = false;
  private retryAttempts = 10;

  get isConnected(): boolean {
    return this._isConnected;
  }

  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly name: string,
  ) {
    this.connection = new Socket(url);
    this.setupSocket();
  }

  public close() {
    this.retryAttempts = -1;
    this.connection.close();
  }

  private setupSocket() {
    this.connection.onClose(this.reconnect);
    this.connection.onError(this.reconnect);
    this.connection.onOpen(this.handleOpen);
    this.connection.onMessage(this.handleMessage);
  }

  private handleMessage(evt: MessageEvent) {
    console.log(evt.data);
  }

  private handleOpen() {
    this._isConnected = true;
    this.retryAttempts = this.maxRetryAttempts;
  }

  private reconnect() {
    this.connection.close();
    this.retryAttempts--;
    if (this.retryAttempts < 0) return;
    setTimeout(() => {
      this.connection = new Socket(this.url);
      this.setupSocket();
    }, this.reconnectTimeout);
  }
}

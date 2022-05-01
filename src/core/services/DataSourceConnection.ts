import { ref } from 'vue';
import { Socket } from '../api/ws/socket';
import { ConnectionStatus } from '../model/dataSource';

export class DataSourceConnection {
  private reconnectTimeout = 3_000;
  private maxRetryAttempts = 10;

  private connection: Socket;
  private retryAttempts = 10;
  private isReconnecting = false;
  private shouldReconnect = true;
  public state = ref<ConnectionStatus>('disconnected');

  constructor(public readonly id: string, public readonly domain: string) {
    this.state.value = 'connecting';
    this.connection = new Socket(this.domain);
    this.setupSocket();
  }

  public close() {
    if (this.connection.state === WebSocket.OPEN) {
      this.shouldReconnect = false;
      this.connection.close();
    }
  }

  private setupSocket() {
    this.connection.onClose(() => this.handleClose());
    this.connection.onError(() => this.handleError());
    this.connection.onOpen(() => this.handleOpen());
    this.connection.onMessage((evt) => this.handleMessage(evt));
  }

  private handleMessage(evt: MessageEvent) {
    console.log(evt.data);
  }

  private handleOpen() {
    this.retryAttempts = this.maxRetryAttempts;
    this.state.value = 'connected';
  }

  private handleError() {
    this.state.value = 'error';
    this.reconnect();
  }

  private handleClose() {
    this.state.value = 'disconnected';
    this.reconnect();
  }

  private reconnect() {
    if (
      this.retryAttempts < 0 ||
      this.isReconnecting ||
      !this.shouldReconnect
    ) {
      return;
    }
    this.retryAttempts--;
    this.isReconnecting = true;
    if (this.connection.state === WebSocket.OPEN) {
      this.close();
    }
    setTimeout(() => {
      this.state.value = 'connecting';
      this.connection = new Socket(this.domain);
      this.setupSocket();
      this.isReconnecting = false;
    }, this.reconnectTimeout);
  }
}

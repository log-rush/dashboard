import { Socket } from '../api/ws/socket';
import { ConnectionStatus } from '../model/dataSource';
import { Log } from '../model/log';
import { LRPCoder, LRPOperation } from './LRPCoder';

export class DataSourceConnection {
  private reconnectTimeout = 3_000;
  private maxRetryAttempts = 3;

  private connection: Socket;
  private retryAttempts = 3;
  private isReconnecting = false;
  private shouldReconnect = true;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private logHandler: (stream: string, log: Log) => void = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private statusUpdateHandler: (status: ConnectionStatus) => void = () => {};

  constructor(public readonly id: string, public readonly domain: string) {
    this.statusUpdateHandler('connecting');
    this.connection = new Socket(this.domain);
    this.setupSocket();
  }

  public close() {
    if (this.connection.state === WebSocket.OPEN) {
      this.shouldReconnect = false;
      this.connection.close();
    }
  }

  public tryReConnect() {
    this.retryAttempts = this.maxRetryAttempts;
    this.shouldReconnect = true;
    this.statusUpdateHandler('warn');
    this.reconnect();
  }

  public subscribe(streamId: string) {
    this.send(
      LRPCoder.encode({
        operation: LRPOperation.OprSubscribe,
        payload: streamId,
      }),
    );
  }

  public unsubscribe(streamId: string) {
    this.send(
      LRPCoder.encode({
        operation: LRPOperation.OprUnsubscribe,
        payload: streamId,
      }),
    );
  }

  public setLogHandler(handler: (stream: string, log: Log) => void) {
    this.logHandler = handler;
  }

  public setStatusUpdateHandler(handler: (status: ConnectionStatus) => void) {
    this.statusUpdateHandler = handler;
  }

  private send(msg: string) {
    if (this.connection.state === WebSocket.OPEN) {
      this.connection.send(msg);
    } else {
      console.warn('could not send (%s)', msg);
    }
  }

  private setupSocket() {
    this.connection.onClose(() => this.handleClose());
    this.connection.onError(() => this.handleError());
    this.connection.onOpen(() => this.handleOpen());
    this.connection.onMessage((evt) => this.handleMessage(evt));
  }

  private handleMessage(evt: MessageEvent) {
    const message = LRPCoder.decode(evt.data);
    console.log(message);

    if (!message) return;
    if (message.operation === LRPOperation.OprStillAlive) {
      console.log('alive test');
      this.connection.send(
        LRPCoder.encode({ operation: LRPOperation.OprAlive, payload: '' }),
      );
    } else if (message.operation === LRPOperation.OprErr) {
      console.warn('lrp error:', message.payload);
    } else if (message.operation === LRPOperation.OprLog) {
      this.handleLog(message.payload);
    }
  }

  private handleLog(msg: string) {
    const [stream, timestamp, ...message] = msg.split(',');
    this.logHandler(stream, {
      message: message.join(','),
      timestamp: parseInt(timestamp, 10) ?? 0,
    });
  }

  private handleOpen() {
    this.retryAttempts = this.maxRetryAttempts;
    this.statusUpdateHandler('connected');
  }

  private handleError() {
    this.statusUpdateHandler('error');
    this.reconnect();
  }

  private handleClose() {
    this.statusUpdateHandler('disconnected');
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
    console.log('reconnecting');
    this.retryAttempts--;
    this.isReconnecting = true;
    if (this.connection.state === WebSocket.OPEN) {
      this.close();
    }
    setTimeout(() => {
      this.statusUpdateHandler('connecting');
      this.connection = new Socket(this.domain);
      this.setupSocket();
      this.isReconnecting = false;
    }, this.reconnectTimeout);
  }
}

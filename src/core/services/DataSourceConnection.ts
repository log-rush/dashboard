import { Socket } from '../api/ws/socket';
import { ConnectionStatus } from '../model/dataSource';
import { LogRecord } from '../model/log';
import { LRPCoder, LRPOperation } from './LRPCoder';

export class DataSourceConnection {
  private reconnectTimeout = 3_000;
  private maxRetryAttempts = 3;

  private connection: Socket;
  private retryAttempts = 3;
  private isReconnecting = false;
  private shouldReconnect = true;
  private suppressCloseStatusUpdate = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private logHandler: (stream: string, log: LogRecord) => void = () => {};

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
      this.suppressCloseStatusUpdate = true;
      this.connection.close();
      this.statusUpdateHandler('available');
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

  public setLogHandler(handler: (stream: string, log: LogRecord) => void) {
    this.logHandler = handler;
  }

  public setStatusUpdateHandler(handler: (status: ConnectionStatus) => void) {
    this.statusUpdateHandler = handler;
  }

  private _queue: string[] = [];
  private send(msg: string) {
    if (this.connection.state === WebSocket.OPEN) {
      this.connection.send(msg);
    } else {
      console.warn('could not send (%s)', msg);
      this._queue.push(msg);
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
    if (!message) return;
    if (message.operation === LRPOperation.OprStillAlive) {
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
    if (this._queue.length > 0) {
      const tmp = [...this._queue];
      this._queue = [];
      for (const msg of tmp) {
        this.send(msg);
      }
    }
    this.statusUpdateHandler('connected');
  }

  private handleError() {
    this.statusUpdateHandler('error');
    this.reconnect();
  }

  private handleClose() {
    if (!this.suppressCloseStatusUpdate) {
      this.statusUpdateHandler('disconnected');
    } else {
      this.suppressCloseStatusUpdate = false;
    }
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
      this.statusUpdateHandler('connecting');
      this.connection = new Socket(this.domain);
      this.setupSocket();
      this.isReconnecting = false;
    }, this.reconnectTimeout);
  }
}

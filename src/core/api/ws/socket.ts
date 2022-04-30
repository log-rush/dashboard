export class Socket {
  private _connection: WebSocket;

  constructor(httpUrl: string) {
    this._connection = new WebSocket(
      `ws://${httpUrl.split('://')[1]}subscribe`,
    );
  }

  public onOpen(handler: (evt: Event) => void) {
    this._connection.onopen = handler;
  }

  public onError(handler: (evt: Event) => void) {
    this._connection.onerror = handler;
  }

  public onClose(handler: (evt: CloseEvent) => void) {
    this._connection.onclose = handler;
  }

  public onMessage(handler: (evt: MessageEvent) => void) {
    this._connection.onmessage = handler;
  }

  public send = (msg: string) => this._connection.send(msg);

  public close = (code?: number, reason?: string) =>
    this._connection.close(code, reason);
}

export class Socket {
  private _connection: WebSocket;

  get state(): number {
    return this._connection.readyState;
  }

  constructor(private readonly domain: string) {
    this._connection = new WebSocket(`ws://${domain}subscribe`);
  }

  public onOpen(handler: (evt: Event) => void) {
    this._connection.onopen = (evt) => {
      handler(evt);
    };
  }

  public onError(handler: (evt: Event) => void) {
    this._connection.onerror = (evt) => {
      handler(evt);
    };
  }

  public onClose(handler: (evt: CloseEvent) => void) {
    this._connection.onclose = (evt) => {
      handler(evt);
    };
  }

  public onMessage(handler: (evt: MessageEvent) => void) {
    this._connection.onmessage = (evt) => {
      handler(evt);
    };
  }

  public send = (msg: string) => this._connection.send(msg);

  public close = (code?: number, reason?: string) =>
    this._connection.close(code, reason);
}

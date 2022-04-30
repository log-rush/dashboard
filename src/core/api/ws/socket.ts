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
      console.log('open');
    };
  }

  public onError(handler: (evt: Event) => void) {
    this._connection.onerror = (evt) => {
      handler(evt);
      console.log('error');
    };
  }

  public onClose(handler: (evt: CloseEvent) => void) {
    this._connection.onclose = (evt) => {
      handler(evt);
      console.log('close');
    };
  }

  public onMessage(handler: (evt: MessageEvent) => void) {
    this._connection.onmessage = (evt) => {
      console.log('message');
      handler(evt);
    };
  }

  public send = (msg: string) => this._connection.send(msg);

  public close = (code?: number, reason?: string) =>
    this._connection.close(code, reason);
}

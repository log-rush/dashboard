import { ref } from 'vue';

export class Socket {
  _connection: WebSocket;

  public state = ref(WebSocket.CLOSED);

  private reconnects: number;

  constructor(
    private readonly domain: string,
    private readonly retryAttempts: number,
    private readonly reconnectTimeout: number,
  ) {
    this.reconnects = retryAttempts;
    this._connection = new WebSocket(`ws://${domain}subscribe`);
    // setup default functions
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onOpen(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onError(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onClose(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onMessage(() => {});
    this.state.value = WebSocket.CONNECTING;
  }

  public onOpen(handler: (evt: Event) => void) {
    this._connection.onopen = (evt) => {
      this.state.value = WebSocket.OPEN;
      handler(evt);
      this.reconnects = this.retryAttempts;
      console.log('open');
    };
  }

  public onError(handler: (evt: Event) => void) {
    this._connection.onerror = (evt) => {
      this.reconnect();
      handler(evt);
      console.log('error');
    };
  }

  public onClose(handler: (evt: CloseEvent) => void) {
    this._connection.onclose = (evt) => {
      this.reconnect();
      handler(evt);
      console.log('close');
    };
  }

  private reconnect() {
    console.log('reconnecting');
    if (this._connection.readyState === WebSocket.OPEN) {
      this.state.value = WebSocket.CLOSING;
      this._connection.close();
    }
    this.state.value = WebSocket.CLOSED;
    this.reconnects--;
    const { onopen, onerror, onmessage, onclose } = this._connection;
    if (this.reconnects < 0) return;
    setTimeout(() => {
      this.state.value = WebSocket.CONNECTING;
      this._connection = new WebSocket(`ws://${this.domain}subscribe`);
      this._connection.onopen = onopen;
      this._connection.onerror = onerror;
      this._connection.onmessage = onmessage;
      this._connection.onclose = onclose;
    }, this.reconnectTimeout);
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

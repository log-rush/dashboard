import { LPMPBaseMessage } from '@/core/model/lpmp.model';

export class LPMPSocket {
  constructor(
    public readonly url: string,
    public readonly msgHandler: (msg: LPMPBaseMessage) => void,
  ) {}

  public ping() {
    throw 'not-implemented';
  }

  public subscribe(streamId: string) {
    throw 'not-implemented';
  }

  public unsubscribe(streamId: string) {
    throw 'not-implemented';
  }

  public listStreams() {
    throw 'not-implemented';
  }
}

export enum LRPOperation {
  OprSubscribe = 0b010010, // 18
  OprUnsubscribe = 0b010100, // 20
  OprAlive = 0b001010, // 10
  OprStillAlive = 0b100010, // 34
  OprLog = 0b100100, // 36
  OprErr = 0b100110, // 38
}

export type LRPMessage = {
  operation: LRPOperation;
  payload: string;
};

export class LRPCoder {
  static encode(msg: LRPMessage): string {
    return `${String.fromCharCode(msg.operation)}${msg.payload}`;
  }

  static decode(msg: string): LRPMessage | undefined {
    if (msg.length < 1) {
      return undefined;
    }
    const firstChar = msg.charCodeAt(0);
    return {
      operation: firstChar as LRPOperation,
      payload: msg.substring(1),
    };
  }
}

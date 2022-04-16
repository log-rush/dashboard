export interface LPMPBaseMessage {
  opr: string;
  payload: unknown;
}

export interface LPMPGetStreamMessage extends LPMPBaseMessage {
  payload: Record<string, never>;
}

export interface LPMPListStreamsMessage extends LPMPBaseMessage {
  payload: {
    value: string[];
  };
}

export interface LPMPLogMessage extends LPMPBaseMessage {
  payload: {
    stream: string;
    value: string;
  };
}

export interface LPMPLogBatchMessage extends LPMPBaseMessage {
  payload: {
    stream: string;
    value: string[];
  };
}

export interface LPMPSubscribeMessage extends LPMPBaseMessage {
  payload: {
    stream: string;
  };
}

export interface LPMPCloseMessage extends LPMPBaseMessage {
  payload: {
    stream: string;
  };
}

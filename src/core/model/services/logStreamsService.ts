import { LogStreamResponse } from '../api/httpTypes';

export interface LogStreamsService {
  getStream(
    dsUrl: string,
    streamId: string,
  ): Promise<LogStreamResponse | undefined>;
}

import { LogRushHttpApi } from '../api/http';
import { LogStreamResponse } from '../model/api/httpTypes';

export const LogStreamsHttpService = {
  async getStream(
    dsUrl: string,
    streamId: string,
  ): Promise<LogStreamResponse | undefined> {
    return await LogRushHttpApi.getStream(dsUrl, streamId);
  },
};

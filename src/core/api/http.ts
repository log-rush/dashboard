import {
  DataSourceInfoResponse,
  LogStreamResponse,
  LogStreamsListResponse,
} from '../model/api/httpTypes';

export const LogRushHttpApi = {
  async getDataSource(
    url: string,
  ): Promise<DataSourceInfoResponse | undefined> {
    try {
      const req = await fetch(`${url}info`);
      if (req.status !== 200) {
        return undefined;
      }
      const res: DataSourceInfoResponse = await req.json();
      return {
        id: res.id,
        name: res.name,
        version: res.version,
      };
    } catch (e: unknown) {
      return undefined;
    }
  },
  async getAllStreams(url: string): Promise<LogStreamResponse[]> {
    try {
      const req = await fetch(`${url}streams`);
      if (req.status !== 200) {
        return [];
      }
      const res: LogStreamsListResponse = await req.json();
      return res.streams;
    } catch (e: unknown) {
      return [];
    }
  },
  async getStream(
    url: string,
    streamId: string,
  ): Promise<LogStreamResponse | undefined> {
    try {
      const req = await fetch(`${url}stream/${streamId}`);
      if (req.status !== 200) {
        return undefined;
      }
      const res: LogStreamResponse = await req.json();
      return res;
    } catch (e: unknown) {
      return undefined;
    }
  },
};

import { DataSource } from '../model/dataSource';
import {
  DataSourceInfoResponse,
  LogStreamResponse,
  LogStreamsListResponse,
} from '../model/api/httpTypes';
import { LogStream } from '../model/stream';

export const LogRushHttpApi = {
  async getDataSource(url: string): Promise<DataSource | undefined> {
    try {
      const req = await fetch(`${url}info`);
      if (req.status !== 200) {
        return undefined;
      }
      const res: DataSourceInfoResponse = await req.json();
      return {
        id: res.id,
        url: url,
        name: res.name,
        version: res.version,
        isConnected: false,
      };
    } catch (e: unknown) {
      return undefined;
    }
  },
  async getAllStreams(dataSource: DataSource): Promise<LogStream[]> {
    try {
      const req = await fetch(`${dataSource.url}streams`);
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
    dataSource: DataSource,
    streamId: string,
  ): Promise<LogStream | undefined> {
    try {
      const req = await fetch(`${dataSource.url}stream/${streamId}`);
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

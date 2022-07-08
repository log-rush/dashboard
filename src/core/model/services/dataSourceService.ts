import { DataSourceInfoResponse, LogStreamResponse } from '../api/httpTypes';

export interface DataSourcesService {
  getDataSource(dsUrl: string): Promise<DataSourceInfoResponse | undefined>;
  getStreams(dsUrl: string): Promise<LogStreamResponse[]>;
}

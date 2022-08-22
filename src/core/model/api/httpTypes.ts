export type DataSourceInfoResponse = {
  id: string;
  name: string;
  version: string;
};

export type LogStreamsListResponse = {
  streams: [
    {
      alias: string;
      id: string;
    },
  ];
};

export type LogStreamResponse = {
  alias: string;
  id: string;
};

export type DataSourcePluginsResponse = {
  routerPlugins: string[];
};

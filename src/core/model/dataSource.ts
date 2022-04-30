export type DataSource = {
  id: string;
  url: string;
  name: string;
  version: string;
};

export type Status =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'warn';

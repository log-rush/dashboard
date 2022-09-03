export class RawLogsPluginApi {
  static readonly baseUrl = 'plugins/raw-logs';

  static getFilePath = (file: string) => `${RawLogsPluginApi.baseUrl}/${file}`;
  static getFileUrl = (url: string, file: string) =>
    `${url}${RawLogsPluginApi.getFilePath(file)}`;

  static async getLogFiles(url: string): Promise<string[]> {
    try {
      const req = await fetch(`${url}${RawLogsPluginApi.baseUrl}/list-all`);
      if (req.status !== 200) {
        return [];
      }
      const res: string[] = await req.json();
      return res;
    } catch (e: unknown) {
      return [];
    }
  }

  static async getLogs(url: string, file: string): Promise<string> {
    try {
      const req = await fetch(RawLogsPluginApi.getFileUrl(url, file));
      if (req.status !== 200) {
        return '';
      }
      return await req.text();
    } catch (e: unknown) {
      return '';
    }
  }
}

export const PersistencyPluginApi = {
  async getLogFiles(url: string, stream: string): Promise<string[]> {
    try {
      const req = await fetch(`${url}plugins/persistency/files/${stream}`);
      if (req.status !== 200) {
        return [];
      }
      const res: { files: string[] } = await req.json();
      return res.files;
    } catch (e: unknown) {
      return [];
    }
  },
  async getLogs(url: string, stream: string, file: string): Promise<string> {
    try {
      const req = await fetch(
        `${url}plugins/persistency/logs/${stream}/${file}`,
      );
      if (req.status !== 200) {
        return '';
      }
      return await req.text();
    } catch (e: unknown) {
      return '';
    }
  },
};

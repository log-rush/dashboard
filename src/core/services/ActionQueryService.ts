import { LocationQuery } from 'vue-router';
import { useDataSources } from '../adapter/dataSources';
import { DataSourceLink } from '../model/dataSource';

export const LinkedDSActionQueryService = {
  handleQuery(query: LocationQuery): void {
    const linked = query['linked'];
    try {
      if (linked && typeof linked === 'string') {
        const data = JSON.parse(atob(linked)) as DataSourceLink;
        useDataSources().createDataSource(data.url);
      }
    } catch {
      // silently
    }
  },
};

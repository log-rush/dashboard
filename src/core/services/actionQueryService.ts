import { ActionQueryService } from '../model/services/actionQueryService';
import { LocationQuery } from 'vue-router';
import { DataSourceLink } from '../model/dataSource';
import { useDataSources } from '../stores/root';

export const LinkedDSActionQueryService: ActionQueryService = {
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

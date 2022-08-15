import { LocationQuery } from 'vue-router';

export interface ActionQueryService {
  handleQuery(query: LocationQuery): void;
}

import { DataSourcesService } from './model/services/dataSourceService';
import { LogStreamsService } from './model/services/logStreamsService';
import { DataSourcesHttpService } from './services/dataSourceService';
import { LogStreamsHttpService } from './services/logStreamsService';

export enum InjectionKey {
  DataSourcesService,
  LogStreamsService,
}

export type InjectedValueMap = {
  [InjectionKey.DataSourcesService]: DataSourcesService;
  [InjectionKey.LogStreamsService]: LogStreamsService;
};

const _injectedValues: InjectedValueMap = {
  [InjectionKey.DataSourcesService]: DataSourcesHttpService,
  [InjectionKey.LogStreamsService]: LogStreamsHttpService,
};

const _overrideValues: Partial<InjectedValueMap> = {
  [InjectionKey.DataSourcesService]: undefined,
  [InjectionKey.LogStreamsService]: undefined,
};

export const Injector = {
  get: <K extends InjectionKey>(key: K): InjectedValueMap[K] => {
    return _overrideValues[key] ?? _injectedValues[key];
  },
  mock: <K extends InjectionKey>(key: K, value: InjectedValueMap[K]) => {
    _overrideValues[key] = value;
  },
};

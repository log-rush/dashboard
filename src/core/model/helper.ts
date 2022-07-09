export interface RecordAble<T> {
  toRecord(): T;
}

export interface StorageRecordAble<T> {
  toStorageRecord(): T;
}

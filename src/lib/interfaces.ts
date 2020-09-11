interface SkyenvRead<T> {
  get(key: keyof T, defaultValue?: T[keyof T]): T[keyof T]
}

interface SkyenvWrite<T> {
  set(key: keyof T, value: T[keyof T]): Promise<void>
}

export type ProviderState = 'ready' | 'error';
interface SkyenvProvider<T> {
  state: ProviderState
  store?: T
  get: SkyenvRead<T>['get'] | never
}

export interface SkyenvDefaultStore {
  [key: string]: string
}

export interface CacheDatabaseProps {
  driver: 'mongodb'
  uri: string
  name?: string
}

export interface SetupSkyenvProps {
  accessId: string
  accessSecret: string
  endpointUrl?: string
  cacheDatabase?: CacheDatabaseProps
}


export interface SkyenvCacheProvider<T> extends SkyenvProvider<T> {
  set: SkyenvWrite<T>['set'] | never
  flush(store: T): Promise<void> | never
  close(): Promise<void> | never
}

export type SkyenvEndpointProvider<T> = SkyenvProvider<T>

export interface SkyenvInstanceProps<T> {
  cache: SkyenvCacheProvider<T>
  endpoint: SkyenvEndpointProvider<T>
}

export interface SkyenvInstance<T = SkyenvDefaultStore> extends SkyenvRead<T> {
  store: T,
  reload(): Promise<void>
}

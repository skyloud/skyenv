import { SkyenvInstanceProps, SkyenvInstance } from './lib/interfaces';

async function persistEndpointStoreToCache<T>(providers: SkyenvInstanceProps<T>) {
  const {
    cache,
    endpoint,
  } = providers;

  try {
    if (cache.state !== 'ready' && endpoint.state !== 'ready') {
      throw '[persistEndpointStoreToCache] no providers available for cache writes';
    }
    if (cache.state !== 'ready') {
      return;
    }
    await cache.flush(endpoint.store);
    await cache.close();
  } catch (err) {
  }
}

export function createInstance<T>(
  providers: SkyenvInstanceProps<T>,
  persistStore = persistEndpointStoreToCache
): SkyenvInstance<T> {
  const {
    cache,
    endpoint,
  } = providers;

  persistStore(providers);

  return {
    store: endpoint.store as T,
    get(key: keyof T, defaultValue: T[keyof T]) {
      try {
        if (endpoint.state === 'ready') {
          return endpoint.get(key, defaultValue);
        }
        if (cache.state === 'ready') {
          return cache.get(key, defaultValue);
        }
      } catch (err) {
        console.log('[WARNING] Unable to load env var');
      }
      return defaultValue;
    },
    reload() {
      throw new Error('Reload is not implemented yet');
    },
  };
}

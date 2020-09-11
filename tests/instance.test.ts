import { createInstance } from '../src/instance';
import { SkyenvCacheProvider, ProviderState, SkyenvEndpointProvider, SkyenvInstance } from '../src/lib/interfaces';

interface AppTestConfig {
  keyA: string
  keyB: string
}

interface SetupInstanceProps {
  cacheStore: AppTestConfig,
  cacheState: ProviderState,
  endpointStore: AppTestConfig,
  endpointState: ProviderState,
}

describe('createInstance', function () {
  let setupInstance: (config: Partial<SetupInstanceProps>) => SkyenvInstance<AppTestConfig>;

  beforeEach(async () => {
    setupInstance = function ({
      cacheState = 'ready',
      cacheStore = { keyA: 'cacheA', keyB: 'cacheB' },
      endpointState = 'ready',
      endpointStore = { keyA: 'endpointA', keyB: 'endpointB' },
    }: Partial<SetupInstanceProps>) {

      const cache: SkyenvCacheProvider<AppTestConfig> = {
        get: (key) => cacheStore[key],
        set: async () => undefined,
        flush: async () => undefined,
        close: async () => undefined,
        store: cacheStore,
        state: cacheState,
      };
      const endpoint: SkyenvEndpointProvider<AppTestConfig> = {
        get: (key) => endpointStore[key],
        store: endpointStore,
        state: endpointState,
      }
      return createInstance({
        cache,
        endpoint,
      });
    }
  });

  it('should create instance and return key value', () => {
    const environment = setupInstance({});

    expect(environment.get('keyA', 'defaultA')).toEqual('endpointA');
  });

  it('should use endpoint value when cache is unavailable', () => {
    const environment = setupInstance({
      cacheState: 'error',
    });

    expect(environment.get('keyB', 'defaultB')).toEqual('endpointB');
  });

  it('should use cache when endpoint is unavailable', () => {
    const environment = setupInstance({
      endpointState: 'error',
    });

    expect(environment.get('keyB', 'defaultB')).toEqual('cacheB');
  });

  it('should use default value when all providers are unavailable', () => {
    const environment = setupInstance({
      endpointState: 'error',
      cacheState: 'error',
    });

    expect(environment.get('keyA', 'defaultA')).toEqual('defaultA');
  });
});
import axios from 'axios';
import { SetupSkyenvProps, SkyenvEndpointProvider } from '../lib/interfaces';
import { get } from '../lib/provider';

export async function connectEndpoint<T>(config: SetupSkyenvProps): Promise<SkyenvEndpointProvider<T>> {
  try {
    const instance = axios.create({
      baseURL: config.endpointUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await instance.post('/api/copy', {
      id: config.accessId,
      secret: config.accessSecret,
    });

    const store = response.data as T;

    return {
      state: 'ready',
      store,
      get: get(store),
    };
  } catch (err) {
    return {
      state: 'error',
      get: () => {
        throw 'Can\'t get value because endpoint is not ready'
      }
    }
  }
}
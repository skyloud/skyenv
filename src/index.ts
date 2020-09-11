import { connectCache } from './services/cache';
import { connectEndpoint } from './services/endpoint';
import { createInstance } from './instance';
import {
  SetupSkyenvProps,
  SkyenvInstance,
  SkyenvDefaultStore,
} from './lib/interfaces';

class SkyenvSingletonInstance implements SkyenvInstance {
  private _instance: SkyenvInstance<SkyenvDefaultStore>;
  public store: SkyenvDefaultStore;

  public async setup(config: SetupSkyenvProps) {
    const endpoint = await connectEndpoint<SkyenvDefaultStore>(config);
    const cache = await connectCache<SkyenvDefaultStore>(config);
    
    this._instance = createInstance<SkyenvDefaultStore>({ endpoint, cache });
    this.store = this._instance.store;

    return this;
  }

  public get(key: string, defaultValue?: string) {
    if ( ! this._instance ) throw 'Please use setup before using get.';
    return this._instance.get(key, defaultValue);
  }

  public reload() {
    if ( ! this._instance ) throw 'Please use setup before using get.';
    return this._instance.reload();
  }
}

export default new SkyenvSingletonInstance();

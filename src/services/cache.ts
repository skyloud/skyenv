import { Binary } from 'bson';
import { MongoClient, Collection } from 'mongodb';
import { SetupSkyenvProps, SkyenvCacheProvider } from '../lib/interfaces';
import { encryptValue, decryptValue } from '../lib/crypt';
import { get } from '../lib/provider';

interface CacheMongoDatabaseResult<T> {
  _id: keyof T
  encryptedValue: Binary
}

function set<T>(store: T, collection: Collection, config: SetupSkyenvProps) {
  return async (key: keyof T, value: T[keyof T]): Promise<void> => {
    const encryptedValue = await encryptValue<T>(config, value);
    await collection.updateOne({
      _id: key
    }, {
      $set: { _id: key, encryptedValue },
    }, {
      upsert: true
    });
    store[key] = value;
  }
}

function flush<T>(collection: Collection, config: SetupSkyenvProps) {
  return async (store: T): Promise<void> => {
    for (const key in store) {
      const persist = set(store, collection, config);
      await persist(key, store[key]);
    }
  }
}

function close(mongo: MongoClient) {
  return () => mongo.close();
}

async function buildStore<T>(config: SetupSkyenvProps, store: T, nextResult: CacheMongoDatabaseResult<T>) {
  const {
    _id: key,
    encryptedValue,
  } = nextResult;
  if ( ! encryptedValue ) {
    return;
  }
  const value = await decryptValue<T>(config, encryptedValue);
  store[key] = value;
}

export async function connectCache<T>(config: SetupSkyenvProps): Promise<SkyenvCacheProvider<T>> {
  const { uri, name = 'skyenv' } = config.cacheDatabase || {};

  try {
    if (!uri) {
      throw new Error('Cache disabled');
    }
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    const mongo = await client.connect();
    const collection = mongo.db().collection(name);
    const dbResults = await collection.find().toArray() as CacheMongoDatabaseResult<T>[];
    const store = {} as T;
    for (const result of dbResults) {
      await buildStore(config, store, result);
    }
    return {
      state: 'ready',
      store,
      get: get<T>(store),
      set: set<T>(store, collection, config),
      flush: flush<T>(collection, config),
      close: close(mongo),
    };
  } catch (err) {
    return {
      state: 'error',
      flush: () => {
        throw 'Can\'t flush because cache is not ready'
      },
      close: () => {
        throw 'Can\'t close because cache is not ready'
      },
      get: () => {
        throw 'Can\'t get value because cache is not ready'
      },
      set: () => {
        throw 'Can\'t set value because cache is not ready'
      },
    }
  }
}

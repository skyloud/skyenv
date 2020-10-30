import axios from 'axios';

const SKYENV_ENDPOINT_URL = 'https://vault.skyloud.net';

interface SkyenvStore {
    [key: string]: string
}

interface SkyenvResolver {
    handler: (config: SkyenvConfig) => Promise<SkyenvStore>
}

interface SkyenvConfig {
    accessId: string
    accessSecret: string
    endpointUrl?: string
}

export const systemEnvResolver: SkyenvResolver = {
    handler: async () => {
        return process.env;
    }
}

export const cloudEnvResolver: SkyenvResolver = {
    handler: async (config: SkyenvConfig) => {
        const instance = axios.create({
            baseURL: config.endpointUrl || SKYENV_ENDPOINT_URL,
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          const response = await instance.post('/api/copy', {
            accessId: config.accessId,
            accessSecret: config.accessSecret,
          });
      
          return response.data;
    }
}

export let env: SkyenvStore = {};

async function skyenv(config: SkyenvConfig, resolvers = [
    systemEnvResolver,
    cloudEnvResolver,
]): Promise<SkyenvStore> {
    env = {};
    for (const resolver of resolvers) {
        const envState = await resolver.handler(config);
        env = {
            ...env,
            ...envState,
        };
    }
    return env;
}

export default skyenv;

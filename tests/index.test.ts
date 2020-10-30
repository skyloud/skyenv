import axios from 'axios';
import skyenv, {
    cloudEnvResolver,
    systemEnvResolver,
    env as skyenvState,
} from '../src/index';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const testConfig = {
    accessId: 'ABC123',
    accessSecret: '123ABC',
}

describe('resolvers', function() {
    describe('systemEnvResolver', function() {
        it('should return process.env value', async function() {
            const env = await systemEnvResolver.handler(testConfig);
            expect(env.NODE_ENV).toEqual('test');
        });
    });
    describe('cloudEnvResolver', function() {
        beforeEach(function() {
            mockedAxios.post.mockResolvedValueOnce({
                data: { ABC: 123 }
            });
            mockedAxios.create.mockImplementationOnce(() => mockedAxios);
        });

        afterEach(function() {
            jest.clearAllMocks();
        });

        it('should create a new axios instance', async function() {
            await cloudEnvResolver.handler(testConfig);
            expect(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: 'https://vault.skyloud.net',
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it('should create a new axios instance with custom enpoint url', async function() {
            await cloudEnvResolver.handler({
                ...testConfig,
                endpointUrl: 'https://vault.example.com'
            });
            expect(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: 'https://vault.example.com',
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it('should copy data using /api/copy path', async function() {
            await cloudEnvResolver.handler(testConfig);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/copy', {
                accessId: 'ABC123',
                accessSecret: '123ABC',
            });
        });

        it('should return json payload env state', async function() {
            const env = await cloudEnvResolver.handler(testConfig);
            expect(env).toEqual({
                ABC: 123
            });
        });

        it('should throw error when endpoint is not available', async function() {
            mockedAxios.post.mockReset();
            mockedAxios.post.mockRejectedValueOnce(new Error('error'));
            
            await expect(cloudEnvResolver.handler(testConfig))
                .rejects
                .toThrow('error');
        });
    });
});

describe('skyenv', function() {

    afterEach(function() {
        // jest.resetAllMocks();
    });

    it('should call resolvers', async function() {
        const resolverOne = { handler: jest.fn() };
        const resolverTwo = { handler: jest.fn() };
        await skyenv(testConfig, [
            resolverOne,
            resolverTwo,
        ]);
        expect(resolverOne.handler).toHaveBeenCalledTimes(1);
        expect(resolverTwo.handler).toHaveBeenCalledTimes(1);
    });

    it('should call resolvers with config', async function() {
        const resolverOne = { handler: jest.fn() };
        await skyenv(testConfig, [
            resolverOne,
        ]);
        expect(resolverOne.handler).toHaveBeenCalledWith(testConfig);
    });

    it('should merge resolved data', async function() {
        const resolverOne = { handler: jest.fn().mockResolvedValueOnce({ a: 1 }) };
        const resolverTwo = { handler: jest.fn().mockResolvedValueOnce({ b: 2 }) };
        const env = await skyenv(testConfig, [
            resolverOne,
            resolverTwo
        ]);
        expect(env).toEqual({
            a: 1,
            b: 2,
        });
    });

    it('should resolve conflict when resolver return same key', async function() {
        const resolverOne = { handler: jest.fn().mockResolvedValueOnce({ a: 1 }) };
        const resolverTwo = { handler: jest.fn().mockResolvedValueOnce({ a: 2 }) };
        const env = await skyenv(testConfig, [
            resolverOne,
            resolverTwo
        ]);
        expect(env).toEqual({ a: 2 });
    });

    it('should keep only latest resolver state value', async function() {
        const resolverOne = { handler: jest.fn().mockResolvedValueOnce({ a: 1 }) };
        const resolverTwo = { handler: jest.fn().mockResolvedValueOnce({ a: 2, b: 1 }) };
        const env = await skyenv(testConfig, [
            resolverTwo,
            resolverOne,
        ]);
        expect(env).toEqual({ a: 1, b: 1 });
    });

    it('should store resolved data in env state', async function() {
        const resolverOne = { handler: jest.fn().mockResolvedValueOnce({ c: 3 }) };
        await skyenv(testConfig, [
            resolverOne,
        ]);
        expect(skyenvState).toEqual({ c: 3 });
    });

});

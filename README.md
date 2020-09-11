# Introduction

This lib gives to your app a new way to setup environment variables on public or private projects.

# How to setup

## Register your app

## Configure the service

```js
// setupenv.ts
interface MyAppEnvironment {
  appSecret: string
  privateKey: string
  contactEmail: string
}

let environment;

export async function() {
  /**
   * We setup our environment here
   */
  environment = await setupSkyenv<MyAppEnvironment>({
    accessId: '<',
    accessToken: '',
    cacheDatabase: {
      driver: 'mongodb',
      uri: 'mongodb+srv://localhost:27017/skyenv-local',
      name: 'skyenv'
    },  
  });
} )();

export default environment;
```
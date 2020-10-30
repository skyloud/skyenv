# Introduction

Welcome on this alpha project about powerfull app environment sharing system. The goal of this project is to securely share staging environment data with other developers through an easy access keys system.

Using this libray, you give to your app a new way to setup dynamic app environment on front-end or backend projects.

# How to setup

First, you have to register your key/value pairs on this app : https://vault.skyloud.net

You'll find an easy way to create your first project (e.g. the name of your app), and finally, create a namespace to define which kind of environment you want (e.g. staging or production) and then create your first credential for your teamate.

## Register your app

### Configure the service at boot

```js
import skyenv from '@skyloud/skyenv';

export async function() {
  /**
   * Fetching environment
   */
  environment = await skyenv({
    accessId: 'ABCD...',
    accessToken: 'ABCDEFGH...',
  });
} )();
```

Then your environment is generally available inv `env` exported variable :

```js
import { env } from '@skyloud/skyenv';

console.log(env); // { abc: 123 }
```

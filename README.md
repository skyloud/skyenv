# Introduction

Welcome on this alpha project about powerful app environment sharing system. The goal of this project is to securely share staging environment data with other developers through easy access keys system.

By using this library, you give to your app a new way to create dynamic app environment on front-end or backend projects using clustered and auto-scalable api.

# Installation

Skyenv is on npm package registry. You can install the dependency with this command :

```bash
$ npm install --save @skyloud/skyenv
```

:warning: **Warning:** This is a alpha package. Do not use it in production environment.

# How to setup

First, you have to register your key/value pairs on this app : https://vault.skyloud.net

You'll find an easy way to create your first project (e.g. the name of your app), and finally, create a namespace to define which kind of environment you want (e.g. staging or production) and then create your first credential for your teammate.

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

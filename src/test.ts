import skyenv from '.';

(async function () {
  await skyenv.setup({
    accessId: '5f3bf5fecc271ea9b44e5243',
    accessSecret: '4a2325f8830c418e5bd44b46c54d93c87fad9a9218c0c1476ce9050408139fd7423b5757041b164a93141b734818b8c6',
    endpointUrl: 'http://localhost:8000',
    // cacheDatabase: {
    //   driver: "mongodb",
    //   uri: 'mongodb://localhost:27017/skyenv-local',
    //   name: 'myApp',
    // }
  });

  const coucou = skyenv.get('ROMAIN'); // return salut

  console.log({ coucou });
})();
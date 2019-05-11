# ¡Hola! Movies

This is a Stremio Add-On is designed to provided movies in 1080p quality with audio language in spanish and english.

## Initialization

Before execution you need to install all dependencies this can be done using the
[`yarn install` command](https://yarnpkg.com/en/docs/install):

```bash
$ yarn install
```

After this you need to configure the following environment variables:

    * CRON_EXPRESSION = 1 1 * * * * 
    * DATABASE_URL = Provided by email
    * JSON_DATA_URL = Provided by email
    * MAX_PAGE = 10
    
[CRON Documentation](https://www.npmjs.com/package/cron)

When this is ready you can start the project with the following command:

```bash
$ node index.js
```

## License

  [MIT](LICENSE)

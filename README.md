# micgt-shopify-build
MIC Guatemala 2.0 Shopify Theme Build

This repo holds the code for the Shopify theme at [jumpdigital.co](https://jumpdigital.co) (jumpdigitalco.myshopify.com)

## Underlying code base

## Preparing your dev workspace:
- Recommended to use a Linux / Mac computer for ocnsole work
- You will need to use Themekit from Shopify (Be advised it is deprecated): https://shopify.dev/docs/themes/tools/theme-kit/getting-started
- Recommended to use Node version 16 or lower, you could use Node Version Manager (nvm) to switch versions just for this project
- You will be required to use GULP JS (Be advised it is deprecated): https://gulpjs.com/ 
- At Shopify create a private app (Develop apps) with permissions to write and read themes and for writing and reading files. This will provide a token you will need to connect your local to your DEV theme at Shopify.

## This theme is built using various technologies:

- It was initially built using the Project X theme provided by [1Rockwell](https://onerockwell.com). These files usually follow the pattern `module-oneDrawer.js` or `module-oneSwatch.js`. Most of this code is probably not used anymore, as it was rewritten in more modern syntax (es6)
- Everything is bundled via webpack.
  - The webpack configuration is split between evinronments:
    - `webpack.common.js` holds all common configuration
    - `webpack.dev.js` holds development/qa specific configuration including sourcemaps and `webpack-dev-server`
    - `webpack.prod.js` basically excludes sourcemaps and removes `console.log`s from the code base on build as well as code minification.
  - `src/scripts/{modules,views}/` holds bundled es6 code, served via the entry point in `./src/scripts/index.js`. This code uses `await import()` in order to asynchronously import code when needed. (see https://webpack.js.org/guides/code-splitting/#dynamic-imports)


- The project was created for 3 different initial versions:
    - Maaji International
    - Maaji Colombia
    - Mercado Blanco

Since a lot of the code is shared, and some of it, is specific to each individual site. 4 Main dev branches were created:
- main
- maincolombia
- 

## How to Start Dev Work:
- Create a theme at Shopify to be used as a reference to visualize your changes.
- Configure the dev environments at config.yml: with a structure similar to this one:

development: (environmente name)
    # MIC GT (Shopify app token)
    password: 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

    ignore_files: (Don't touch this config unless you know)
        - node_modules/
        - templates/.json
        - upload
        - deploy.log
        - config.yml
        - settings_data.json     

- As a recommendation, NEVER work on a live / production theme
- At the duplicated or created theme, enable the webpack dev server, should be found under the Global Settings for the theme at the customize menu.
- Be sure you are in the right branch to start your work
- Run `npm run watch` to start working and checking your changes
- When complete and ready to deploy run:
    `npm run {Deployment type} && theme deploy --env {environment name at your .yml file} --dir dist --allow-live`

    There are 3 types of deployments: 
        - `build:dev`: Will not minimized or optimize code for production, will show all the console logs.
        - `build:qa`: Will minimize but not remove console logging.
        - `build:prod`: Will compile, minimize and remove console logs for a production version
- Deployment Recommendations: 
    - Delete your `dist` folder before making a depployment
    - IMPORTANT: The 3 projects use Pagefly App to create custom landing pages, make sure to download and sync to your theme the pagefly created files at /assets, /sections and /templates before making a new deployment.
    - Never add or sync pagefly files at the main branch, as the files are exclusive to each individual website.
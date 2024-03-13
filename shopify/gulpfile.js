/**
 *
 * This file used only to keep the src -> dist folder structure,
 * whereas all development work is done in the src folder, copied to
 * the dist folder, and then uploaded by themekit to Shopify from dist/
 * using `theme watch`
 *
 * Only *.liquid files are affected, javascript and scss/css are handled
 * by Webpack
 *
 **/

const path = require('path');
const { src, dest, watch } = require('gulp');
const destination = 'dist/';
const shopifyFileGlob = 'src/**/*liquid';
const jsonFileGlob = 'src/config/*.json';

function transpileLiquid() {
    // Copy liquid files from src/ to dist/ if a change
    // is detected
    return src(shopifyFileGlob).pipe(dest(destination));
}

function transpileJson() {
    return src(jsonFileGlob).pipe(dest(path.resolve(destination, 'config')));
}

function defaultTask() {
    // Watch for file changes
    watch(shopifyFileGlob, transpileLiquid);
    watch(jsonFileGlob, transpileJson);
}

exports.default = defaultTask;

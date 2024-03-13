const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval',
    plugins: [
        new webpack.DefinePlugin({
            'ENVIRONMENT': '"development"',
        })
    ],
    devServer: {
        host: 'localhost',
        port: 9090,
        transportMode: 'ws',
        // Currently, I can't figure out how to get liveReload/hot module reload working,
        // due to CORS between localhost and Shopify's servers, this line stops webpack from
        // injecting a websocket client to avoid
        injectClient: false,
        publicPath: '/micgt/assets/',
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
    }
})

const path = require('path');
const webpack = require('webpack');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            }),
            // new CssMinimizerPlugin()
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'ENVIRONMENT': '"production"',
        }),
        // new MiniCssExtractPlugin()
    ],
})

// require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const injectLocalesIntoSettingsSchema = require('./bin/inject-locales-into-settings-schema');
const argv = require('yargs').argv;

const {
    ENVIRONMENT,
} = process.env;

const paths = {
    src: {
        assets: path.resolve(__dirname, 'src', 'assets'),
        config: path.resolve(__dirname, 'src', 'config'),
        layout: path.resolve(__dirname, 'src', 'layout'),
        locales: path.resolve(__dirname, 'src', 'locales'),
        sections: path.resolve(__dirname, 'src', 'sections'),
        snippets: path.resolve(__dirname, 'src', 'snippets'),
        templates: path.resolve(__dirname, 'src', 'templates'),
    },
    dist: {
        assets: path.resolve(__dirname, 'dist', 'assets'),
        config: path.resolve(__dirname, 'dist', 'config'),
        layout: path.resolve(__dirname, 'dist', 'layout'),
        locales: path.resolve(__dirname, 'dist', 'locales'),
        sections: path.resolve(__dirname, 'dist', 'sections'),
        snippets: path.resolve(__dirname, 'dist', 'snippets'),
        templates: path.resolve(__dirname, 'dist', 'templates'),
    },
};

const stylesEnrty = {
    home: './src/styles/home-entry.js',
    collection: './src/styles/collection-entry.js',
    product: './src/styles/product-entry.js',
    cart: './src/styles/cart-entry.js',
    account: './src/styles/account-entry.js',
    orders: './src/styles/orders-entry.js',
    blog: './src/styles/blog-entry.js',
    article: './src/styles/article-entry.js',
    checkout: './src/styles/checkout-entry.js',
};

module.exports = {
    entry: {
        main: ['./src/scripts/index.js', './src/styles/theme-entry.js'],
        checkout: ['./src/scripts/checkout.js'],
        ...stylesEnrty,
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[id].[contenthash].js',
        path: path.resolve(__dirname, 'dist/assets'),
    },
    module: {
        rules: [
            {
                test: /\.js(x|)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            [
                                '@babel/plugin-transform-react-jsx',
                                {
                                    pragma: 'createElement',
                                    pragmaFrag: "'fragment'",
                                },
                            ],
                            '@babel/plugin-proposal-class-properties',
                        ],
                    },
                },
            },
            {
                test: /\.html$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'underscore-template-loader',
                },
            },
            {
                test: /\.((sa)|(s?c))ss$/,
                exclude: /(node_modules)/,
                use: [
                    'cache-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: !argv.production,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !argv.production,
                        },
                    },
                ],
            },
            {
                test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.ts(x|)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    /* Uncomment to use external jQuery as $ */
    // externals: {
    //     jquery: 'jQuery'
    // },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.ENVIRONMENT': JSON.stringify(ENVIRONMENT)
        }),
        /* Uncomment to use internal jQuery as $ */
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(paths.src.assets),
                    to: path.resolve(paths.dist.assets, '[name][ext]')
                    //noErrorOnMissing: true
                },
                {
                    from: paths.src.config,
                    to: paths.dist.config,
                    globOptions: {
                        ignore: ['./**/settings_data.json'],
                    },
                    // transform(content, filePath) {
                    //     // return injectLocalesIntoSettingsSchema(
                    //     //     content,
                    //     //     filePath
                    //     // );
                    // },
                },
                {
                    from: paths.src.layout,
                    to: paths.dist.layout,
                },
                {
                    from: paths.src.locales,
                    to: paths.dist.locales,
                },
                {
                    from: paths.src.sections,
                    to: paths.dist.sections,
                },
                {
                    from: paths.src.snippets,
                    to: paths.dist.snippets,
                },
                {
                    from: paths.src.templates,
                    to: paths.dist.templates,
                },
            ],
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            App: path.resolve(__dirname, 'src/scripts/'),
            Lib: path.resolve(__dirname, 'src/scripts/lib/'),
            Modules: path.resolve(__dirname, 'src/scripts/modules/'),
            Pages: path.resolve(__dirname, 'src/scripts/pages/'),
            Templates: path.resolve(__dirname, 'src/scripts/templates/'),
            Views: path.resolve(__dirname, 'src/scripts/views/'),
            Styles: path.resolve(__dirname, 'src/styles/'),
            node_modules: path.resolve(__dirname, 'node_modules'),
        },
    },
};

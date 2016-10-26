require('dotenv').load({ silent: true });

const Webpack = require('webpack');
const AutoPrefixer = require('autoprefixer');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const APP_ROOT = require('app-root-path');
const PRODUCTION = (process.env.NODE_ENV == 'production');


module.exports = (config) => {
    config = config || {};
    
    var webpack_config = {
        cache: true,
        entry: {
            client: [`${config.APP_ROOT || APP_ROOT}/app/client/index.js`]
        },
        output: {
            path: `${config.APP_ROOT || APP_ROOT}/build`,
            publicPath: '/assets/',
            filename: '[name]-[hash].js'
        },
        module: {
            loaders: [
                { 
                    test: /\.js$/, 
                    exclude: /node_modules/,
                    loader: 'babel?presets[]=react&presets[]=es2015'
                },
                {
                    test: /\.(css|scss)$/,
                    loader: PRODUCTION ?
                        ['style', 'css?modules&camelCase&minimize', 'postcss'].join('!')
                        : 
                        ['style', 'css?modules&camelCase&sourcemaps&localIdentName=[name]__[local]__[hash:base64:5]', 'postcss'].join('!')
                },
                {
                    test: /\.(jpg|png|gif)$/,
                    loader: 'file?name=[name]-[hash].[ext]'
                }
            ],
        },
        postcss: [
            AutoPrefixer({ browsers: ['last 2 versions'] })
        ],
        plugins: [
            new Webpack.EnvironmentPlugin(Object.keys(process.env)),
            new HtmlPlugin({
                filename: 'client.html',
                chunks: ['client'],
                inject: false,
                template: `${config.APP_ROOT || APP_ROOT}/app/server/client.html`,
                favicon: `${config.APP_ROOT || APP_ROOT}/app/assets/images/favicon.png`,
                minify: {
                    keepClosingSlash: true,
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true
                }
            }),
            new CopyPlugin([
                { from: `${config.APP_ROOT || APP_ROOT}/app/server/public/**/*`, to: `${config.APP_ROOT || APP_ROOT}/build` }
            ])
        ],
        resolve: {
            root: [
                `${config.APP_ROOT || APP_ROOT}/app/`,
                `${config.APP_ROOT || APP_ROOT}/app/server/views`
            ]
        }
    };

    if (PRODUCTION) {
        webpack_config.plugins.push(new Webpack.optimize.UglifyJsPlugin({ sourceMap: false, compress: { warnings: false }}));
    }
    
    return webpack_config;
}
require('dotenv').load({ silent: true });

const Path = require('path');
const Webpack = require('webpack');
const AutoPrefixer = require('autoprefixer');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const APP_ROOT = require('app-root-path').toString();
const PRODUCTION = (process.env.NODE_ENV == 'production');


module.exports = (config) => {
    config = config || {};
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    var webpack_config = {
        cache: true,
        entry: {
            client: [`${app_root}/app/client/index.js`]
        },
        output: {
            path: `${app_root}/build`,
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
                template: `${app_root}/app/server/client.html`,
                favicon: `${app_root}/app/assets/images/favicon.png`,
                minify: {
                    keepClosingSlash: true,
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true
                }
            }),
            new CopyPlugin([
                { from: `${app_root}/app/server/public` }
            ])
        ],
        resolve: {
            root: [
                `${app_root}/app/`,
                `${app_root}/app/server/views`
            ]
        }
    };

    if (PRODUCTION) {
        webpack_config.plugins.push(new Webpack.optimize.UglifyJsPlugin({ sourceMap: false, compress: { warnings: false }}));
    }
    
    return webpack_config;
}
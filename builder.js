const Path = require('path');
const FS = require('fs-extra');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const Log = require('./log');

const APP_ROOT = require('app-root-path').toString();

const DEV_SERVER_PORT = 8080;

const defaultWebpackConfig = require('./templates/webpack.config');


const Tasks = {};


Tasks.clean = function (config) {
    config = config || {};
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        return FS.emptyDir(`${app_root}/build`, (err) => {
            if (err) return reject(err);
            
            Log.info('clean', 'Cleaned build directory');
            resolve();
        });
    });
};


Tasks.build = function (config, args) {
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    config = config || {};
    args = args || [];
    
    var webpack_config;
    try {
        webpack_config = require(`${app_root}/webpack.config`);
    } catch (e) {
        webpack_config = defaultWebpackConfig(config);
    }
    
    return new Promise ((resolve, reject) => {
        if (args.includes('--hot') || args.includes('hot')) {
            Log.info('build', "Building with", Log.bold.magenta("Hot Reload"));
            Object.keys(webpack_config.entry).forEach((entry) => {
                webpack_config.entry[entry].unshift(`webpack-dev-server/client?http://localhost:${DEV_SERVER_PORT}`, "webpack/hot/dev-server");
            });
            webpack_config.output.publicPath = `http://localhost:${DEV_SERVER_PORT}/assets/`;
            webpack_config.plugins.push(new Webpack.HotModuleReplacementPlugin());
        } else {
            Log.info('build', "Building");
        }
        
        let compiler = Webpack(webpack_config);
        if (process.env.NODE_ENV !== 'production') {
            compiler.apply(new Webpack.ProgressPlugin((percent, message) => {
                Log.clearLine();
                if (percent < 1) {
                    Log.progressInfo('build', `${Math.floor(percent * 100)}%`, Log.gray(`(${message})`));
                }
            }));
        }
        
        compiler.run((err, stats) => {
            if (err) return reject(err);
            
            stats = stats.toJson();
            
            if (stats.errors.length > 0) {
                stats.errors.forEach((error) => {
                    Log.error('build', error);
                });
                return reject(stats.errors);
            }
            if (stats.warnings.length > 0) {
                stats.warnings.forEach((warning) => {
                    Log.warning('build', warning);
                });
            }
            
            if (stats.errors.length == 0 && stats.warnings.length == 0) {
                Log.info('build', 'Build finished in', Log.bold(`${Math.round(stats.time / 1000)} seconds`));
            }
            
            return resolve(stats);
        });
    });
};
    
    
Tasks.run = function (config, args) {
    let tasks = this;
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    var webpack_config;
    try {
        webpack_config = require(`${app_root}/webpack.config`);
    } catch (e) {
        webpack_config = defaultWebpackConfig(config);
    }
    
    let server_path = `${app_root}/app/server`;
    var server = require(server_path);
    
    return new Promise((resolve, reject) => {
        let compiler = Webpack(webpack_config);
        let watcher;
        
        if (process.env.NODE_ENV !== 'production') {
            server.watcher = watcher = FS.watch(server_path, { recursive: true }, (event, filename) => {
                server.stop(() => {
                    // Load in any actual file changes
                    Object.keys(require.cache).forEach((key) => {
                        if (key.includes(`${server_path}/`)) {
                            delete require.cache[key];
                        }
                    });
                    server = require(server_path);
                    server.watcher = watcher;
                    
                    server.start(() => {
                        let now = new Date();
                        Log.notice('hot', 'Server restarted', Log.gray(`at ${now.toTimeString()}`));
                    });
                });
            });
        
            compiler.apply(new Webpack.ProgressPlugin((percent, message) => {
                if (percent == 1) {
                    let now = new Date();
                    Log.notice('hot', 'Latest build ready', Log.gray(`at ${now.toTimeString()}`));
                }
            }));
        }
        
        var assetServer = new WebpackDevServer(compiler, {
            hot: true,
            contentBase: `${app_root}/build/`,
            publicPath: '/assets/',
            noInfo: true
        });
        assetServer.listen(DEV_SERVER_PORT, "localhost", (err) => {
            if (err) reject(err);
            
            server.start(() => {
                Log.info('run', 'Server started at http://localhost:5000');
                Log.info('run', Log.gray('Press Ctrl+C to stop'));
                
                // Attach a copy of the asset server
                server.assetServer = assetServer;
                
                return resolve(server);
            });
        });
    });
};


Tasks.buildAndRun = function (config) {
    return Tasks.clean().then(() => {
        return Tasks.build(config, ['--hot']).then(() => {
            return Tasks.run(config);
        });
    });
};


module.exports = Tasks;
module.exports.DEFAULT_WEBPACK_CONFIG = defaultWebpackConfig();
const Path = require('path');
const FS = require('fs-extra');
const Webpack = require('webpack');
const Log = require('./log');

const APP_ROOT = require('app-root-path').toString();

const DEV_SERVER_PORT = 5050;

const defaultWebpackConfig = require('./templates/webpack.config');


function flags (args) {
    args = args || [];
    return args.map(arg => arg.replace(/^\-\-/, ''));
}


function clearRequireCache (target) {
    Object.keys(require.cache).forEach((key) => {
        if (key.includes(target)) {
            delete require.cache[key];
        }
    });
}


// Load the webpack config and apply hot reload options if needed
function webpackConfig (config, args, logged) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    var webpack_config;
    try {
        clearRequireCache(`${app_root}/webpack.config`);
        webpack_config = require(`${app_root}/webpack.config`);
        if (typeof webpack_config === "function") {
            webpack_config = webpack_config(config, args);
        }
    } catch (e) {
        webpack_config = defaultWebpackConfig(config, args);
    }
    
    if (args.includes('hot')) {
        if (logged) {
            Log.info("Building with", Log.bold.magenta("Hot Reload"));
        }
        Object.keys(webpack_config.entry).forEach((entry) => {
            webpack_config.entry[entry].unshift(`webpack-dev-server/client?http://localhost:${DEV_SERVER_PORT}`, "webpack/hot/dev-server");
        });
        webpack_config.output.publicPath = `http://localhost:${DEV_SERVER_PORT}/assets/`;
        webpack_config.plugins.push(new Webpack.HotModuleReplacementPlugin());
    } else if (logged){
        Log.info("Building");
    }
    
    return webpack_config;
}



const Tasks = {};


Tasks.clean = function (config) {
    config = config || {};
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        return FS.emptyDir(`${app_root}/build`, (err) => {
            if (err) return reject(err);
            
            Log.info('Build directory is now empty');
            resolve();
        });
    });
};


Tasks.build = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise ((resolve, reject) => {
        let webpack_config = webpackConfig(config, args, true);
        
        let compiler = Webpack(webpack_config);
        if (process.env.NODE_ENV !== 'production') {
            compiler.apply(new Webpack.ProgressPlugin((percent, message) => {
                Log.clearLine();
                if (percent < 1) {
                    Log.progressInfo(`${Math.floor(percent * 100)}%`, Log.gray(`(${message})`));
                }
            }));
        }
        
        compiler.run((err, stats) => {
            if (err) return reject(err);
            
            stats = stats.toJson();
            
            if (stats.errors.length > 0) {
                stats.errors.forEach((error) => {
                    Log.error(error);
                });
                return reject(stats.errors);
            }
            if (stats.warnings.length > 0) {
                stats.warnings.forEach((warning) => {
                    Log.warning(warning);
                });
            }
            
            if (stats.errors.length == 0 && stats.warnings.length == 0) {
                Log.info('Build finished in', Log.bold(`${Math.round(stats.time / 1000)} seconds`));
            }
            
            return resolve(stats);
        });
    });
};
    
    
Tasks.run = function (config, args) {
    const WebpackDevServer = require('webpack-dev-server');
    
    config = config || {};
    args = flags(args);
    
    let tasks = this;
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    let webpack_config = webpackConfig(config, args);
    
    let server_path = `${app_root}/app/server`;
    var server = require(server_path);
    
    return new Promise((resolve, reject) => {
        let compiler = Webpack(webpack_config);
        let watcher;
        
        if (process.env.NODE_ENV !== 'production') {
            server.watcher = watcher = FS.watch(server_path, { recursive: true }, (event, filename) => {
                server.stop(() => {
                    // Load in any actual file changes
                    clearRequireCache(`${server_path}/`);
                    server = require(server_path);
                    server.watcher = watcher;
                    
                    server.start(() => {
                        let now = new Date();
                        Log.notice('Server restarted', Log.gray(`at ${now.toTimeString()}`));
                    });
                });
            });
        
            compiler.apply(new Webpack.ProgressPlugin((percent, message) => {
                if (percent == 1) {
                    let now = new Date();
                    Log.notice('Latest build ready', Log.gray(`at ${now.toTimeString()}`));
                }
            }));
        }
        
        var assetServer = new WebpackDevServer(compiler, {
            hot: true,
            contentBase: `${app_root}/build/`,
            publicPath: '/assets/',
            noInfo: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
        assetServer.listen(DEV_SERVER_PORT, "localhost", (err) => {
            if (err) return reject(err);
            
            server.start(() => {
                Log.info('Server started at', Log.bold('http://localhost:5000'));
                Log.info(Log.gray('Press Ctrl+C to stop'));
                
                // Attach a copy of the asset server
                server.assetServer = assetServer;
                
                return resolve(server);
            });
        });
    });
};


Tasks.buildAndRun = function (config) {
    return Tasks.clean().then(() => {
        return Tasks.build(config, ['hot']).then(() => {
            return Tasks.run(config, ['hot']);
        });
    });
};


module.exports = Tasks;
module.exports.defaultWebpackConfig = defaultWebpackConfig;

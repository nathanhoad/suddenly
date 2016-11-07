const Generate = require('./generate');
const Builder = require('./builder');
const Database = require('./database');
const Server = require('./server');
const Mailer = require('./mailer');
const Log = require('./log');

const APP_ROOT = require('app-root-path').toString();


function Suddenly () {
    this.WEBPACK_CONFIG = Builder.WEBPACK_CONFIG;
    
    this.tasks = {};
}

Suddenly.prototype.Log = Log;

Suddenly.prototype.routes = Server.routes;
Suddenly.prototype.mailer = Mailer.create;

/*
    Register a command line task
*/
Suddenly.prototype.task = function (name, prerequisites, task, exit_after_complete) {
    let suddenly = this;
    
    let args = Array.from(arguments).filter((a) => typeof a !== "undefined");
    if (args.length <= 3) {
        exit_after_complete = task;
        task = prerequisites;
        prerequisites = [];
    }
    
    suddenly.tasks[name] = function (config, args) {
        return Promise.all(prerequisites).then(() => {
            if (exit_after_complete === false) {
                return task(config, args);
            } else {
                return task(config, args).then(() => process.exit());
            }
        });
    }
    
    return suddenly;
};


/*
    Register a task only if one hasn't already been registered
*/
Suddenly.prototype.defaultTask = function (name, prerequisites, task, exit_after_complete) {
    let suddenly = this;
    
    if (suddenly.hasOwnProperty(name)) return;
        
    suddenly.task(name, prerequisites, task, exit_after_complete);
};


/*
    Execute any tasks that match the command
*/
Suddenly.prototype.handleTasks = function (config, argv) {
    if (typeof argv == "undefined") argv = process.argv;
    
    let suddenly = this;
    
    // Load in the default tasks
    suddenly.defaultTask('run', Server.run, false);

    suddenly.defaultTask('build', Builder.build);
    suddenly.defaultTask('build:run', Builder.buildAndRun, false);
    suddenly.defaultTask('build:clean', Builder.clean);

    suddenly.defaultTask('db:migrate', Database.migrate);
    suddenly.defaultTask('db:rollback', Database.rollback);
    suddenly.defaultTask('db:version', Database.version);
    suddenly.defaultTask('db:schema', Database.schema);

    suddenly.defaultTask('generate:component', Generate.component);
    suddenly.defaultTask('generate:reducer', Generate.reducer);
    suddenly.defaultTask('generate:actions', Generate.actions);
    suddenly.defaultTask('generate:style', Generate.style);

    suddenly.defaultTask('generate:migration', Generate.migration);
    suddenly.defaultTask('generate:model', Generate.model);
    suddenly.defaultTask('generate:routes', Generate.routes);
    suddenly.defaultTask('generate:resource', Generate.resource);
    suddenly.defaultTask('generate:notification', Generate.notification);
    
    if (!config.APP_ROOT) config.APP_ROOT = APP_ROOT;
    
    let task_name = argv[2];
    let task = suddenly.tasks[task_name];
    if (task) {
        return task(config, argv.slice(3));
    } else {
        Log.error(task_name, Log.bold(task_name), 'is not defined');
        Log.error(task_name, Log.gray('You can define it in'), Log.gray.bold('bin/suddenly'));
        process.exit();
    }
};


module.exports = new Suddenly();
module.exports.Instance = Suddenly;
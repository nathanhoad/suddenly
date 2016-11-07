const FS = require('fs-extra');
const Path = require('path');
const Inflect = require('i')();
const Knex = require('knex');
const Log = require('./log');

const APP_ROOT = require('app-root-path').toString();


function setupKnex (config) {
    return Knex({
        client: 'pg',
        connection: config.DATABASE_URL
    });
}


function saveTemplate (filename, replacements, save_to_file) {
    let template = FS.readFileSync(`${__dirname}/templates/${filename}`, 'utf8');
    Object.keys(replacements).forEach((find) => {
        template = template.replace(new RegExp('{{' + find.toUpperCase() + '}}', 'g'), replacements[find]);
    });
    
    FS.mkdirsSync(Path.dirname(save_to_file));
    FS.writeFileSync(save_to_file, template);
    
    return template;
}


function justFilename (thing_path, things_path) {
    return thing_path.replace(new RegExp(things_path + '/?'), '');
}


function flags (args) {
    args = args || [];
    return args.map(arg => arg.replace(/^\-\-/, ''));
}



const Generate = function () {};


Generate.prototype.migration = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        const options = {
            tableName: 'schema_migrations',
            directory: Path.resolve(`${app_root}/migrations`)
        };
        
        let knex = setupKnex(config);
        let name = args[0].replace(/\s/g, '-');
        
        knex.migrate.make(Inflect.dasherize(name), options).then((migration_path) => {
            saveTemplate('migration.js', {}, migration_path);
            // Log.info('generate:migration', 'Created migration', Log.bold(justFilename(migration_path, options.directory)));
            Log.info('Created migration', Log.bold(justFilename(migration_path, options.directory)));
            return resolve([migration_path]);
        }).catch((err) => {
            Log.error(err.message);
            return reject(err);
        });
    });
};


Generate.prototype.model = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        const options = {
            tableName: 'schema_migrations',
            directory: Path.resolve(`${app_root}/migrations`)
        };
        
        let knex = setupKnex(config);
        let name = args[0].toLowerCase();
        let models_path = `${app_root}/app/server/models`;
        FS.mkdirsSync(models_path);
        
        let files = [];
        
        let table_name = Inflect.tableize(name);
        let model_path = `${models_path}/${Inflect.dasherize(Inflect.singularize(table_name))}.js`;
        
        if (args.includes('no-migration')) {
            Log.muted('Skipped creating migration');
            
            if (args.includes('no-model')) {
                Log.muted('Skipped creating model');
                return resolve([]); // Not sure why anyone would do this but whatever
            }
            
            saveTemplate('model.js', { table: table_name, model: Inflect.classify(name) }, model_path);
            Log.info("Created model", Log.bold(justFilename(model_path, models_path)));
            files = [model_path];
            return resolve(files);
            
        } else {
            knex.migrate.make(`create-${Inflect.dasherize(table_name)}`, options).then((migration_path) => {
                saveTemplate('model-migration.js', { table: table_name }, migration_path);
                Log.info('Created migration', Log.bold(justFilename(migration_path, options.directory)));
                files.push(migration_path);
                
                if (args.includes('no-model')) {
                    Log.muted('Skipped creating model');
                } else {
                    saveTemplate('model.js', { table: table_name, model: Inflect.classify(name) }, model_path);
                    Log.info("Created model", Log.bold(justFilename(model_path, models_path)));
                    files.push(model_path);
                }
                
                return resolve(files);
                
            }).catch(err => {
                Log.error(err.message);
                return reject(err);
            });
        }
    });
};


Generate.prototype.routes = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        let name = args[0].toLowerCase();
        let routes_path = Path.resolve(`${app_root}/app/server/routes`);
        FS.mkdirsSync(routes_path);
        let routes_tests_path = Path.resolve(`${app_root}/test/routes`);
        FS.mkdirsSync(routes_tests_path);
        
        let files = [];
        
        // Generate the routes
        let route = Inflect.dasherize(Inflect.pluralize(name));
        let route_path = `${routes_path}/${route}-routes.js`;
        saveTemplate('routes.js', { route: route }, route_path);
        Log.info("Created routes", Log.bold(justFilename(route_path, routes_path)));
        files.push(route_path);
        
        if (args.includes('no-tests')) {
            Log.muted('Skipped creating tests');
        } else {
            // Generate the tests
            let route_test_path = `${routes_tests_path}/${route}-routes-test.js`;
            saveTemplate('routes-test.js', { route: route }, route_test_path);
            Log.info("Created test", Log.bold(justFilename(route_test_path, routes_tests_path)));
            files.push(route_test_path);
        }
        
        return resolve(files);
    });
};


Generate.prototype.resource = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        let name = args[0].toLowerCase();
        let resources_path = Path.resolve(`${app_root}/app/server/resources`);
        FS.mkdirsSync(resources_path);
        let files = [];
        
        let resource = Inflect.dasherize(name);
        let resource_path = `${resources_path}/${resource}-resource.js`;
        saveTemplate('resource.js', { model: Inflect.underscore(name) }, resource_path);
        Log.info("Created resource", Log.bold(justFilename(resource_path, resources_path)));
        files.push(resource_path);
        
        return resolve(files);
    });
};


Generate.prototype.notification = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        let name = args[0].toLowerCase();
        let notifications_path = Path.resolve(`${app_root}/app/server/notifications`);
        FS.mkdirsSync(notifications_path);
        
        let files = [];
        
        // Create the method in nofications/index.js
        let notification_js_path = `${notifications_path}/index.js`;
        let method = Inflect.camelize(Inflect.underscore(name), false);
        
        let file_contents = FS.readFileSync(notification_js_path, 'utf8');
        file_contents += `\n\nmodule.exports.${method} = (user, callback) => {\n\tMailer.${method}(user.get('email'), '${method}', { user: user.toJSON() }, callback);\n};`;
        FS.writeFileSync(notification_js_path, file_contents);
        Log.info("Updated notifications/index.js");
        files.push(notification_js_path);
        
        // Save the email template
        let notification = Inflect.dasherize(Inflect.pluralize(name));
        let notification_path = `${notifications_path}/${notification}.html`;
        saveTemplate('notification.html', { notification: notification }, notification_path);
        Log.info("Created a new notification", Log.bold(justFilename(notification_path, notifications_path)));
        files.push(notification_path);
        
        return resolve(files);
    });
};


Generate.prototype.actions = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        let name = args[0].toLowerCase();
        let actions_path = Path.resolve(`${app_root}/app/client/actions`);
        FS.mkdirsSync(actions_path);
        let tests_path = Path.resolve(`${app_root}/test/actions`);
        FS.mkdirsSync(tests_path);
        
        let files = [];
        
        // Actions
        let action = Inflect.dasherize(Inflect.pluralize(name));
        let action_path = `${actions_path}/${action}-actions.js`;
        saveTemplate('actions.js', {
            plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
            plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
            plural_class: Inflect.camelize(Inflect.pluralize(name)),
            single_constant: Inflect.underscore(name).toUpperCase(),
            single_lowercase: Inflect.underscore(name).toLowerCase(),
            single_class: Inflect.camelize(name),
        }, action_path);
        Log.info("Created actions", Log.bold(justFilename(action_path, actions_path)));
        files.push(action_path);
        
        // test
        if (args.includes('no-tests')) {
            Log.muted('Skipped creating tests');
        } else {
            let test_path = `${tests_path}/${action}-actions-test.js`;
            saveTemplate('actions-test.js', {
                plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
                plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
                plural_class: Inflect.camelize(Inflect.pluralize(name)),
                single_constant: Inflect.underscore(name).toUpperCase(),
                single_lowercase: Inflect.underscore(name).toLowerCase(),
                single_class: Inflect.camelize(name)
            }, test_path);
            Log.info("Created test", Log.bold(justFilename(test_path, tests_path)));
            files.push(test_path);
        }
        
        return resolve(files);
    });
};


Generate.prototype.reducer = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        let name = args[0].toLowerCase();
        let reducers_path = Path.resolve(`${app_root}/app/client/reducers`);
        FS.mkdirsSync(reducers_path);
        let tests_path = Path.resolve(`${app_root}/test/reducers`);
        FS.mkdirsSync(tests_path);
        
        let files = [];
        
        // Create the reducer
        let reducer = Inflect.dasherize(Inflect.pluralize(name));
        let reducer_path = `${reducers_path}/${reducer}-reducer.js`;
        saveTemplate('reducer.js', {
            plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
            plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
            plural_class: Inflect.camelize(Inflect.pluralize(name)),
            single_constant: Inflect.underscore(name).toUpperCase(),
            single_lowercase: Inflect.underscore(name).toLowerCase(),
            single_class: Inflect.camelize(name)
        }, reducer_path);
        Log.info("Created reducer", Log.bold(justFilename(reducer_path, reducers_path)));
        files.push(reducer_path);
        
        // Add the reduder to the index
        let reducers_index_path = Path.resolve(`${app_root}/app/client/reducers/index.js`);
        let reducers_index = FS.readFileSync(reducers_index_path, 'utf8').split("\n");
        
        let reducer_name = Inflect.underscore(Inflect.pluralize(name)).toLowerCase();
        
        let line_index = reducers_index.findIndex(line => line.match(/^const ReduxImmutable/));
        reducers_index.splice(line_index + 2, 0, `const ${reducer_name} = require('./${reducer_name}-reducer');`);
        line_index = reducers_index.findIndex(line => line.match(/ReduxImmutable\.combineReducers/));
        reducers_index.splice(line_index + 1, 0, `\t${reducer_name},`);
        FS.writeFileSync(reducers_index_path, reducers_index.join('\n'));
        files.push(reducers_index_path);
        
        // Create tests
        if (args.includes('no-tests')) {
            Log.muted('Skipped creating tests');
        } else {
            let test_path = `${tests_path}/${reducer}-reducer-test.js`;
            saveTemplate('reducer-test.js', {
                plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
                plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
                plural_class: Inflect.camelize(Inflect.pluralize(name)),
                single_constant: Inflect.underscore(name).toUpperCase(),
                single_lowercase: Inflect.underscore(name).toLowerCase(),
                single_class: Inflect.camelize(name)
            }, test_path);
            Log.info("Created tests", Log.bold(justFilename(test_path, tests_path)));
            files.push(test_path);
        }
        
        resolve(files);
    });
};


Generate.prototype.component = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        let name = args[0].toLowerCase();
        let components_path = Path.resolve(`${app_root}/app/client/components`);
        FS.mkdirsSync(components_path);
        let styles_path = Path.resolve(`${app_root}/app/assets/styles`);
        FS.mkdirsSync(styles_path);
        let tests_path = Path.resolve(`${app_root}/test/components`);
        FS.mkdirsSync(tests_path);
        let files = [];
        
        let connected = args.includes('connected');
        
        // Component
        let component = Inflect.dasherize(name);
        let component_path = `${components_path}/${component}.js`;
        saveTemplate((connected ? 'component-connected.js' : 'component.js'), { 
            class_name: Inflect.classify(Inflect.underscore(name)),
            file_name: Inflect.dasherize(name)
        }, component_path);
        Log.info((connected ? "Created connected component" : "Created component"), Log.bold(justFilename(component_path, components_path)));
        files.push(component_path);
        
        // Stylesheet
        if (args.includes('no-style')) {
            Log.muted('generate:component', 'Skipped creating style');
        } else {
            let style_path = `${styles_path}/${component}.css`;
            saveTemplate('style.css', {}, style_path);
            Log.info("Created style", Log.bold(justFilename(style_path, styles_path)));
            files.push(style_path);
        }
        
        // Tests
        if (args.includes('no-tests')) {
            Log.muted('generate:component', 'Skipped creating tests');
        } else {
            let test_path = `${tests_path}/${component}-test.js`;
            saveTemplate((connected ? 'component-connected-test.js' : 'component-test.js'), { 
                class_name: Inflect.classify(Inflect.underscore(name)),
                file_name: Inflect.dasherize(name)
            }, test_path);
            Log.info("Created tests", Log.bold(justFilename(test_path, tests_path)));
            files.push(test_path);
        }
        
        resolve(files);
    });
};


Generate.prototype.style = function (config, args) {
    config = config || {};
    args = flags(args);
    
    let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
    
    return new Promise((resolve, reject) => {
        if (args.length == 0) {
            Log.error('No name specified');
            return reject(new Error('No name specified'));
        }
        
        let name = args[0].toLowerCase();
        let styles_path = Path.resolve(`${app_root}/app/assets/styles`);
        FS.mkdirsSync(styles_path);
        
        let files = [];
        
        let component = Inflect.dasherize(name);
        let style_path = `${styles_path}/${component}.css`;
        saveTemplate('style.css', {}, style_path);
        Log.info("Created style", Log.bold(justFilename(style_path, styles_path)));
        files.push(style_path);
        
        resolve(files);
    });
}




module.exports = new Generate();
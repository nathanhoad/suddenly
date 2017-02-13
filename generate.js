const FS = require('fs-extra');
const Path = require('path');
const Inflect = require('i')();
const Knex = require('knex');
const Log = require('./log');
const merge = require('lodash/merge');
const flattenDeep = require('lodash/flattenDeep');

const APP_ROOT = require('app-root-path').toString();


function setupKnex (config) {
    return Knex({
        client: 'pg',
        connection: config.DATABASE_URL
    });
}


function saveTemplate (file_or_filename, replacements, save_to_file) {
    let template = '';

    if (file_or_filename.includes('\n')) {
        template = file_or_filename;
    } else {
        template = FS.readFileSync(`${__dirname}/templates/${file_or_filename}`, 'utf8');
    }
    
    // Change tabs to spaces
    replacements['\t'] = '    ';

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



const Generate = {
    migration (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }

            if (args.includes('no-migration')) {
                Log.muted('Skipping migration');
                return resolve([]);
            }

            const options = {
                tableName: 'schema_migrations',
                directory: Path.resolve(`${app_root}/migrations`)
            };

            let knex = setupKnex(config);
            let name = args[0].replace(/\s/g, '-');
            
            let table_name = Inflect.tableize(name);
            
            let migration_name = Inflect.dasherize(name);
            let migration_template = 'migration.js';
            if (args.includes('model')) {
                migration_name = `create-${Inflect.dasherize(name)}`;
                migration_template = 'model-migration.js';
            }
            
            let define_slug = '';
            let slug_index = '';
            if (args.includes('endpoint')) {
                define_slug = `table.string('slug');\n\t\t\t`;
                slug_index = `\n\t\t\ttable.index('slug');`;
            }
            
            // Try to guess the intent of the migration
            let add_columns = '';
            let drop_columns = '';
            if (!args.includes('model') && !args.includes('endpoint')) {
                let matches = name.match(/^add\-(.*?)-to-(.*?)$/);
                if (matches && matches.length == 3) {
                    table_name = matches[2];
                    
                    let columns = matches[1].split('-and-').map(c => Inflect.underscore(c));
                    add_columns = columns.map(c => {
                        return `table.string('${c}');`;
                    }).join('\n\t\t\t');
                    
                    drop_columns = `table.dropColumns(${columns.map(c => `'${c}'`).join()});`;
                } else {
                    table_name = name.split('-')[name.split('-').length - 1];
                }
            }

            knex.migrate.make(migration_name, options).then((migration_path) => {
                saveTemplate(migration_template, {
                    table: table_name,
                    add_columns: add_columns,
                    drop_columns: drop_columns,
                    define_slug: define_slug,
                    slug_index: slug_index
                }, migration_path);
                Log.info('Created migration', Log.bold(justFilename(migration_path, options.directory)));

                return resolve([migration_path]);

            }).catch((err) => {
                Log.error(err.message);
                return reject(err);
            });
        });
    },


    model (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
        let files = [];

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }

            if (args.includes('no-model')) {
                Log.muted('Skipping creating model');
                return resolve(files);
            }

            // Create the model
            let name = args[0].toLowerCase();
            let models_path = `${app_root}/app/server/models`;
            FS.mkdirsSync(models_path);

            let table_name = Inflect.tableize(name);
            let model_path = `${models_path}/${Inflect.dasherize(Inflect.singularize(table_name))}.js`;

            let generate_slug = '';
            let testing_slug = '';
            if (args.includes('endpoint')) {
                generate_slug = `\n\t\t\tthis.attributes.slug = this.attributes.slug || Gimmea.slug(this.attributes.id, 8);`;
                testing_slug = `\n\t\tslug: Values.word(),`;
            }

            saveTemplate('model.js', {
                table: table_name,
                model: Inflect.classify(name.replace('-', '_')),
                generate_slug: generate_slug
            }, model_path);
            Log.info("Created model", Log.bold(justFilename(model_path, models_path)));
            files = files.concat(model_path);

            // Add the model to the testing forge
            let testing_template = `\nTesting.forge{{MODEL_CLASS}} = (details) => {
    let properties = _.assign({}, {
        id: Testing.uuid(),{{TESTING_SLUG}}
        // TODO: Add any other required fields
    }, details);

    return {{MODEL_CLASS}}.forge(properties);
};


Testing.create{{MODEL_CLASS}} = (details) => {
    return {{MODEL_CLASS}}.create(Testing.forge{{MODEL_CLASS}}(details));
};\n\n\nmodule.exports = Testing`;

            let testing_path = Path.resolve(`${app_root}/test/testing.js`);
            let testing = FS.readFileSync(testing_path, 'utf8').replace('module.exports = Testing', testing_template);

            testing = `const {{MODEL_CLASS}} = require('app/server/models/{{MODEL_REQUIRE}}');\n` + testing;

            saveTemplate(testing, {
                model_class: Inflect.classify(Inflect.singularize(name.replace('-', '_'))),
                model_require: Inflect.dasherize(Inflect.singularize(name.toLowerCase().replace(' ', '_'))),
                testing_slug: testing_slug
            }, testing_path);
            Log.warning('Modified', Log.bold('test/testing.js'));
            files = files.concat(testing_path);

            return resolve(files);
        });
    },


    routes (config, args) {
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

            // Generate the routes
            let route = Inflect.dasherize(Inflect.pluralize(name));
            let route_path = `${routes_path}/${route}-routes.js`;
            
            let template = (args.includes('endpoint') ? 'routes-endpoint.js' : 'routes.js');
            
            saveTemplate(template, { 
                route: route,
                model_class: Inflect.classify(Inflect.underscore(name)),
                model_lowercase: Inflect.singularize(Inflect.underscore(name)).toLowerCase(),
                model_lowercase_dashed: Inflect.singularize(Inflect.dasherize(name)).toLowerCase(),
                models_lowercase: Inflect.pluralize(Inflect.underscore(name)).toLowerCase()
            }, route_path);
            Log.info("Created routes", Log.bold(justFilename(route_path, routes_path)));

            return resolve([route_path]);
        });
    },


    routesTests (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }
            
            if (args.includes('no-tests')) {
                Log.muted('Skipped creating tests');
                return resolve([]);
            }

            let name = args[0].toLowerCase();
            let routes_tests_path = Path.resolve(`${app_root}/test/routes`);
            FS.mkdirsSync(routes_tests_path);

            let route = Inflect.dasherize(Inflect.pluralize(name));
            let route_test_path = `${routes_tests_path}/${route}-routes-test.js`;
            
            let template = (args.includes('endpoint') ? 'routes-endpoint-test.js' : 'routes-test.js');
            
            saveTemplate(template, {
                route: route,
                model_class: Inflect.classify(Inflect.underscore(name)),
                model_lowercase: Inflect.singularize(Inflect.underscore(name)).toLowerCase(),
                model_lowercase_dashed: Inflect.singularize(Inflect.dasherize(name)).toLowerCase(),
                models_lowercase: Inflect.pluralize(Inflect.underscore(name)).toLowerCase()
            }, route_test_path);
            Log.info("Created test", Log.bold(justFilename(route_test_path, routes_tests_path)));

            return resolve([route_test_path]);
        });
    },
    
    
    prerequisite (config, args) {
        config = config || {};
        args = flags(args);
        
        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);
        
        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }
            
            if (args.includes('no-prerequisite')) {
                Log.muted('Skipped creating prerequisite');
                return resolve([]);
            }
            
            let prerequisite_method_template = `},
    
    
    {{MODEL_LOWERCASE}} (request, reply) {
        if (!request.params.{{MODEL_LOWERCASE}}) return reply();

        let id_or_slug = Validator.isUUID(request.params.{{MODEL_LOWERCASE}}) ? 'id' : 'slug';
        {{MODEL_CLASS}}.where({ [id_or_slug]: request.params.{{MODEL_LOWERCASE}} }).fetch().then(({{MODEL_LOWERCASE}}) => {
            reply({{MODEL_LOWERCASE}});
        }).catch((err) => {
            reply();
        });
    }
}
    
    
module.exports = Prerequisites;`;
    
            let name = args[0].toLowerCase();
            let prerequisites_path = Path.resolve(`${app_root}/app/server/prerequisites.js`);
            let prerequisites = FS.readFileSync(prerequisites_path, 'utf8');
            
            prerequisites = prerequisites.replace(/}[,\s]*?}[;\s]*?module\.exports = Prerequisites;/, prerequisite_method_template);
            prerequisites = `const {{MODEL_CLASS}} = require('app/server/models/{{MODEL_LOWERCASE}}');\nconst {{MODEL_CLASS}}Resource = require('app/server/resources/{{MODEL_LOWERCASE}}-resource');\n${prerequisites}`;
            
            saveTemplate(prerequisites, {
                model_class: Inflect.classify(Inflect.underscore(name)),
                model_lowercase: Inflect.singularize(Inflect.underscore(name)).toLowerCase()
            }, prerequisites_path);
            Log.warning('Modified', Log.bold('app/server/prerequisites.js'));
            
            return resolve([prerequisites_path]);
        });
    },


    resource (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }

            if (args.includes('no-resource')) {
                Log.muted('Skipped creating resource');
                return resolve([]);
            }
            
            

            let name = args[0].toLowerCase();
            let resources_path = Path.resolve(`${app_root}/app/server/resources`);
            FS.mkdirsSync(resources_path);
            
            let slug = '';
            if (args.includes('endpoint')) {
                slug = `,\n\t\tslug: ${Inflect.underscore(Inflect.singularize(name))}.slug`;
            }

            let resource = Inflect.dasherize(Inflect.singularize(name));
            let resource_path = `${resources_path}/${resource}-resource.js`;
            saveTemplate('resource.js', { 
                model: Inflect.underscore(Inflect.singularize(name)),
                slug: slug
            }, resource_path);
            Log.info("Created resource", Log.bold(justFilename(resource_path, resources_path)));

            return resolve([resource_path]);
        });
    },


    notification (config, args) {
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
            file_contents += `\n\n\nmodule.exports.${method} = (user, callback) => {\n\tMailer.${method}(user.get('email'), '${method}', { user: user.toJSON() }, callback);\n};`;
            FS.writeFileSync(notification_js_path, file_contents);
            Log.info("Updated notifications/index.js");
            files.push(notification_js_path);

            // Save the email template
            let notification = Inflect.dasherize(Inflect.singularize(name));
            let notification_path = `${notifications_path}/${notification}.html`;
            saveTemplate('notification.html', { notification: notification }, notification_path);
            Log.info("Created a new notification", Log.bold(justFilename(notification_path, notifications_path)));
            files.push(notification_path);

            return resolve(files);
        });
    },


    actions (config, args) {
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

            let action = Inflect.dasherize(Inflect.singularize(name));
            let action_path = `${actions_path}/${action}-actions.js`;
            saveTemplate('actions.js', {
                plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
                plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
                plural_class: Inflect.camelize(Inflect.pluralize(Inflect.underscore(name))),
                single_constant: Inflect.underscore(Inflect.singularize(name)).toUpperCase(),
                single_lowercase: Inflect.underscore(Inflect.singularize(name)).toLowerCase(),
                single_class: Inflect.camelize(Inflect.singularize(Inflect.underscore(name)))
            }, action_path);
            Log.info("Created actions", Log.bold(justFilename(action_path, actions_path)));

            return resolve([action_path]);
        })
    },


    actionsTests (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }

            if (args.includes('no-tests')) {
                Log.muted('Skipped creating tests');
                return resolve([]);
            }

            let name = args[0].toLowerCase();
            let tests_path = Path.resolve(`${app_root}/test/actions`);
            FS.mkdirsSync(tests_path);

            let action = Inflect.dasherize(Inflect.singularize(name));
            let test_path = `${tests_path}/${action}-actions-test.js`;
            saveTemplate('actions-test.js', {
                plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
                plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
                plural_class: Inflect.camelize(Inflect.pluralize(Inflect.underscore(name))),
                single_constant: Inflect.underscore(Inflect.singularize(name)).toUpperCase(),
                single_lowercase: Inflect.underscore(Inflect.singularize(name)).toLowerCase(),
                single_lowercase_dashed: Inflect.dasherize(Inflect.singularize(name)).toLowerCase(),
                single_class: Inflect.camelize(Inflect.singularize(Inflect.underscore(name)))
            }, test_path);
            Log.info("Created test", Log.bold(justFilename(test_path, tests_path)));

            return resolve([test_path]);
        });
    },


    reducer (config, args) {
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

            let files = [];

            // Create the reducer
            let reducer = Inflect.dasherize(Inflect.pluralize(name));
            let reducer_path = `${reducers_path}/${reducer}-reducer.js`;
            saveTemplate('reducer.js', {
                plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
                plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
                plural_class: Inflect.camelize(Inflect.pluralize(Inflect.underscore(name))),
                single_constant: Inflect.underscore(Inflect.singularize(name)).toUpperCase(),
                single_lowercase: Inflect.underscore(Inflect.singularize(name)).toLowerCase(),
                single_class: Inflect.camelize(Inflect.singularize(Inflect.underscore(name)))
            }, reducer_path);
            Log.info("Created reducer", Log.bold(justFilename(reducer_path, reducers_path)));
            files.push(reducer_path);

            // Add the reduder to the index
            let reducers_index_path = Path.resolve(`${app_root}/app/client/reducers/index.js`);
            let reducers_index = FS.readFileSync(reducers_index_path, 'utf8').split("\n");

            let reducer_name = Inflect.underscore(Inflect.pluralize(name)).toLowerCase();

            let line_index = reducers_index.findIndex(line => line.match(/^const ReduxImmutable/));
            reducers_index.splice(line_index + 2, 0, `const ${reducer_name} = require('./${Inflect.dasherize(reducer_name)}-reducer');`);
            line_index = reducers_index.findIndex(line => line.match(/ReduxImmutable\.combineReducers/));
            reducers_index.splice(line_index + 1, 0, `\t${reducer_name},`);
            FS.writeFileSync(reducers_index_path, reducers_index.join('\n'));
            files.push(reducers_index_path);

            return resolve(files);
        });
    },


    reducerTests (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }

            if (args.includes('no-tests')) {
                Log.muted('Skipped creating tests');
                return resolve([]);
            }

            let name = args[0].toLowerCase();
            let tests_path = Path.resolve(`${app_root}/test/reducers`);
            FS.mkdirsSync(tests_path);

            let reducer = Inflect.dasherize(Inflect.pluralize(name));
            let test_path = `${tests_path}/${reducer}-reducer-test.js`;
            saveTemplate('reducer-test.js', {
                plural_constant: Inflect.underscore(Inflect.pluralize(name)).toUpperCase(),
                plural_lowercase: Inflect.underscore(Inflect.pluralize(name)).toLowerCase(),
                plural_class: Inflect.camelize(Inflect.pluralize(Inflect.underscore(name))),
                single_constant: Inflect.underscore(Inflect.singularize(name)).toUpperCase(),
                single_lowercase: Inflect.underscore(Inflect.singularize(name)).toLowerCase(),
                single_class: Inflect.camelize(Inflect.singularize(Inflect.underscore(name)))
            }, test_path);
            Log.info("Created tests", Log.bold(justFilename(test_path, tests_path)));

            return resolve([test_path]);
        });
    },


    component (config, args) {
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

            let connected = args.includes('connected');
            let with_provider = args.includes('with-provider');

            // Component
            let component = Inflect.dasherize(name);
            let component_path = `${components_path}/${component}.js`;
            saveTemplate((connected ? 'component-connected.js' : 'component.js'), {
                class_name: Inflect.titleize(Inflect.underscore(name)).replace(/[^\w]/g, ''),
                file_name: Inflect.dasherize(name)
            }, component_path);
            Log.info((connected ? "Created connected component" : "Created component"), Log.bold(justFilename(component_path, components_path)));

            return resolve([component_path]);
        });
    },


    componentTests (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }

            if (args.includes('no-tests')) {
                Log.muted('Skipped creating tests');
                return resolve([]);
            }

            let name = args[0].toLowerCase();
            let tests_path = Path.resolve(`${app_root}/test/components`);
            FS.mkdirsSync(tests_path);

            let connected = args.includes('connected');
            let with_provider = args.includes('with-provider');

            let component = Inflect.dasherize(name);
            let test_path = `${tests_path}/${component}-test.js`;
            let template = 'component-test.js';
            if (with_provider) {
                template = 'component-with-provider-test.js';
            } else if (connected) {
                template = 'component-connected-test.js';
            }
            saveTemplate(template, {
                class_name: Inflect.titleize(Inflect.underscore(name)).replace(/[^\w]/g, ''),
                file_name: Inflect.dasherize(name)
            }, test_path);
            Log.info("Created tests", Log.bold(justFilename(test_path, tests_path)));

            return resolve(test_path);
        });
    },


    style (config, args) {
        config = config || {};
        args = flags(args);

        let app_root = Path.resolve(config.APP_ROOT || APP_ROOT);

        return new Promise((resolve, reject) => {
            if (args.length == 0) {
                Log.error('No name specified');
                return reject(new Error('No name specified'));
            }

            if (args.includes('no-style')) {
                Log.muted('generate:component', 'Skipped creating style');
                return resolve([]);
            }

            let name = args[0].toLowerCase();
            let styles_path = Path.resolve(`${app_root}/app/assets/styles`);
            FS.mkdirsSync(styles_path);

            let component = Inflect.dasherize(name);
            let style_path = `${styles_path}/${component}.css`;
            saveTemplate('style.css', {}, style_path);
            Log.info("Created style", Log.bold(justFilename(style_path, styles_path)));

            return resolve([style_path]);
        });
    }
};


function combine (tasks, extra_config, extra_args) {
    return function (config, args){
        config = config || {};
        args = flags(args);

        if (args.length == 0) {
            Log.error('No name specified');
            return Promise.reject(new Error('No name specified'));
        }

        if (extra_config) config = merge(config, extra_config)
        if (extra_args) args = args.concat(extra_args);

        let promisified_tasks = tasks.map((task) => task(config, args));

        return Promise.all(promisified_tasks).then((filess) => {
            return flattenDeep([filess]);
        });
    }
}


// Build the tasks
module.exports.migration = Generate.migration;

module.exports.model = combine([Generate.model, Generate.migration], {}, ['model']);
module.exports.routes = combine([Generate.routes, Generate.routesTests, Generate.resource]);
module.exports.endpoint = combine([Generate.model, Generate.migration, Generate.routes, Generate.routesTests, Generate.resource, Generate.prerequisite], {}, ['model', 'endpoint']);
module.exports.resource = Generate.resource;
module.exports.notification = Generate.notification;

module.exports.actions = combine([Generate.actions, Generate.actionsTests]);
module.exports.reducer = combine([Generate.reducer, Generate.reducerTests]);
module.exports.redux = combine([Generate.actions, Generate.actionsTests, Generate.reducer, Generate.reducerTests]);
module.exports.component = combine([Generate.component, Generate.componentTests, Generate.style]);
module.exports.style = Generate.style;

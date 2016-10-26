const Path = require('path');
const FS = require('fs-extra');
const Inflect = require('i')();
const Knex = require('knex');
const Log = require ('./log');

const APP_ROOT = require('app-root-path');


const Tasks = function () {};


Tasks.prototype.migrate = function (config) {
    let tasks = this;
    
    var options = {
        directory: `${config.APP_ROOT || APP_ROOT}/migrations`,
        models: `${config.APP_ROOT || APP_ROOT}/app/server/models`,
        tableName: 'schema_migrations'
    }
    
    let knex = Knex({
        client: 'pg',
        connection: config.DATABASE_URL
    });
    
    return new Promise((resolve, reject) => {
        knex.migrate.latest(options).then((results) => {
            let files = [];
            
            if (results[1].length == 0) {
                Log.muted('db:migrate', 'No migrations to run');
            } else {
                Log.info('db:migrate', Log.bold(`Migrating group ${results[0]}`));
                results[1].forEach((migration_path) => {
                    Log.info('migrate', Log.gray(migration_path.replace(Path.dirname(options.directory) + '/migrations/', '')));
                    files.push(migration_path);
                });
            }
            return resolve(files);
            
        }).catch((err) => {
            Log.error('db:migrate', err);
            return reject(err);
        });
    });
};

    
Tasks.prototype.rollback = function (config) {
    let tasks = this;
    
    var options = {
        directory: `${config.APP_ROOT || APP_ROOT}/migrations`,
        models: `${config.APP_ROOT || APP_ROOT}/app/server/models`,
        tableName: 'schema_migrations'
    }
    
    let knex = Knex({
        client: 'pg',
        connection: config.DATABASE_URL
    });
    
    return new Promise((resolve, reject) => {
        knex.migrate.rollback(options).then((results) => {
            let files = [];
            
            if (results[1].length == 0) {
                Log.muted('db:rollback', 'Nothing to roll back');
            } else {
                Log.warning('db:rollback', Log.bold(`Rolling back group ${results[0]}`));
                results[1].forEach((migration_path) => {
                    Log.warning('db:rollback', Log.gray(migration_path.replace(Path.dirname(options.directory) + '/migrations/', '')));
                    files.push(migration_path);
                });
            }
            return resolve(files);
            
        }).catch((err) => {
            Log.error('db:rollback', err);
            return reject(err);
        });
    });
};

    
Tasks.prototype.version = function (config) {
    let tasks = this;
    
    var options = {
        directory: `${config.APP_ROOT || APP_ROOT}/migrations`,
        models: `${config.APP_ROOT || APP_ROOT}/app/server/models`,
        tableName: 'schema_migrations'
    }
    
    let knex = Knex({
        client: 'pg',
        connection: config.DATABASE_URL
    });
    
    return new Promise((resolve, reject) => {
        knex.migrate.currentVersion(options).then((version) => {
            if (version == 'none') {
                version = null;
                Log.muted('db:version', 'No migrations have been run');
            } else {
                Log.info('db:version', 'Database is at version', Log.bold(version));
            }
            
            return resolve(version);
        });
    });
};
    

Tasks.prototype.schemaForTable = function (config, args) {
    config = config || {};
    args = args || [];
    
    let tasks = this;
    let table = args[0];
    
    let knex = Knex({
        client: 'pg',
        connection: config.DATABASE_URL
    });
    
    return knex.raw(`select column_name, data_type, is_nullable, column_default from information_schema.columns where table_name = '${table}';`).then((result) => {
        let columns = [];
        result.rows.forEach((column) => {
            let meta = [];
            
            if (column.is_nullable == 'NO') {
                meta.push('not nullable');
            }
            if (column.column_default) {
                meta.push(`default ${column.column_default}`);
            }
            
            if (meta.length > 0) {
                meta = `(${meta.join(', ')})`;
            } else {
                meta = '';
            }
            
            columns.push({
                name: column.column_name,
                type: column.data_type,
                meta: meta
            });
        });
        
        return Promise.resolve({ table: table, columns: columns });
    });
};


Tasks.prototype.schema = function (config, args) {
    config = config || {};
    args = args || [];
    
    let tasks = this;
    
    let knex = Knex({
        client: 'pg',
        connection: config.DATABASE_URL
    });
    
    let table = args[0];
    return new Promise((resolve, reject) => {
        if (table) {
            return tasks.schemaForTable(config, [table]).then((schema) => {
                Log.info('db:schema', Log.bold(schema.table.toUpperCase()));
                
                schema.columns.forEach((column) => {
                    Log.info('db:schema', `${column.name}:`, Log.yellow(column.type), Log.gray(column.meta));
                });
                
                return resolve([schema]);
            });
            
        } else {
            return knex.raw("select table_name from information_schema.tables where table_schema = 'public'").then((result) => {
                let queries = [];
                
                result.rows.forEach((table) => {
                    if (table.table_name.includes('schema_migrations')) return;
                    
                    queries.push(tasks.schemaForTable(config, [table.table_name]));
                });
                
                // return resolve(Promise.all(queries));
                return Promise.all(queries).then((schemas) => {
                    schemas.forEach((schema, index) => {
                        Log.info('db:schema', Log.bold(schema.table.toUpperCase()));
                        
                        schema.columns.forEach((column) => {
                            Log.info('db:schema', `${column.name}:`, Log.yellow(column.type), Log.gray(column.meta));
                        });
                        
                        if (index < schemas.length - 1) {
                            Log.info('db:schema', '');
                        }
                    });
                    
                    return resolve(schemas);
                });
            });
        }
    });
};


module.exports = new Tasks();
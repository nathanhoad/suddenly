const Lab = require('lab');
const expect = require('code').expect;
const Path = require('path');
const FS = require('fs-extra');
const Knex = require('knex');

const lab = exports.lab = Lab.script();

const Database = require('../database');

const Log = require('../log');
Log.silent = true;


lab.experiment('Database', () => {
    var config = {};
    var knex;
    
    
    lab.beforeEach((done) => {
        config = {
            APP_ROOT: `${__dirname}/../tmp`,
            DATABASE_URL: process.env.DATABASE_URL || 'postgres://localhost:5432/suddenly_test'
        };
        
        knex = Knex({
            client: 'pg',
            connection: config.DATABASE_URL
        });
        
        // Empty the project folder
        FS.remove(`${__dirname}/../tmp/*`, () => {
            // Empty the database
            Promise.all([
                knex.schema.dropTable('schema_migrations'),
                knex.schema.dropTable('things')
            ]).then(() => {
                done();
            }).catch(() => {
                // The first time this is run it will complain about there
                // not being a migrations table
                done();
            });
        });
    });
    
    
    lab.suite('migrate', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp`, () => {
                FS.copy(`${__dirname}/database`, `${__dirname}/../tmp`, (err) => {
                    done();
                });
            });
        });
        
        
        lab.test('does nothing when there are no migrations to run', (done) => {
            Database.migrate(config).then(() => {
                Database.migrate(config).then((files) => {
                    expect(files).to.be.an.array();
                    expect(files.length).to.equal(0);
                    done();
                });
            });
        });
        
        
        lab.test('can run pending migrations', (done) => {
            Database.migrate(config).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(1);
                expect(files[0]).to.match(/create\-things\.js$/);
                done();
            });
        });
    });
    
    
    lab.suite('rollback', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp`, () => {
                FS.copy(`${__dirname}/database`, `${__dirname}/../tmp`, (err) => {
                    done();
                });
            });
        });
        
        
        lab.test('does nothing when there are no migrations to rollback', (done) => {
            Database.rollback(config).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(0);
                done();
            });
        });
        
        
        lab.test('can roll back migrations', (done) => {
            Database.migrate(config).then(() => {
                Database.rollback(config).then((files) => {
                    expect(files).to.be.an.array();
                    expect(files.length).to.equal(1);
                    expect(files[0]).to.match(/create\-things\.js$/);
                    
                    done();
                });
            });
        });
    });
    
    
    lab.suite('version', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp`, () => {
                FS.copy(`${__dirname}/database`, `${__dirname}/../tmp`, (err) => {
                    done();
                });
            });
        });
        
        
        lab.test('does nothing when there are no migrations', (done) => {
            Database.version(config).then((version) => {
                expect(version).to.be.null();
                done();
            });
        });
        
        
        lab.test('can roll back migrations', (done) => {
            Database.migrate(config).then(() => {
                Database.version(config).then((version) => {
                    expect(version).to.equal('20161013224158');
                    done();
                });
            });
        });
    });
    
    
    lab.suite('schema', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp`, () => {
                FS.copy(`${__dirname}/database`, `${__dirname}/../tmp`, (err) => {
                    done();
                });
            });
        });
        
        
        lab.test('does nothing when there are no migrations', (done) => {
            Database.schema(config).then((schema) => {
                expect(schema).to.be.an.array();
                expect(schema.length).to.equal(0);
                done();
            });
        });
        
        
        lab.test('gets the schema for all tables', (done) => {
            Database.migrate(config).then(() => {
                Database.schema(config).then((schema) => {
                    expect(schema).to.be.an.array();
                    expect(schema.length).to.equal(1);
                    expect(schema[0]).to.contain(['table', 'columns']);
                    done();
                });
            });
        });
        
        
        lab.test('gets the schema for a specific table', (done) => {
            Database.migrate(config).then(() => {
                Database.schema(config, ['things']).then((schema) => {
                    expect(schema).to.be.an.array();
                    expect(schema.length).to.equal(1);
                    expect(schema[0]).to.contain(['table', 'columns']);
                    done();
                }).catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });
});
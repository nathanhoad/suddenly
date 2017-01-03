const Lab = require('lab');
const expect = require('code').expect;
const FS = require('fs-extra');
const Path = require('path');

const lab = exports.lab = Lab.script();

const Generate = require('../generate');
const Log = require('../log');
Log.silent = true;


lab.experiment('Generate', () => {
    var config = {};
    
    lab.beforeEach((done) => {
        config.APP_ROOT = Path.resolve(`${__dirname}/../tmp`);
        
        // Empty the project folder
        FS.remove(`${__dirname}/../tmp/*`, () => {
            done();
        });
    });
    
    
    lab.suite('migration', () => {
        lab.test('generates a migration file', (done) => {
            Generate.migration(config, ['add a thing']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(1);
                
                var file_contents = FS.readFileSync(files[0], "utf8");
                
                expect(file_contents).to.include('up (knex, Promise) {');
                expect(file_contents).to.include('down (knex, Promise) {');
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    
    
    lab.suite('model', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/generate`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('fails with no args', (done) => {
            Generate.model(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            });
        });
        
        
        lab.test('generates a model and a migration by default', (done) => {
            Generate.model(config, ['thing']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(3);
                
                // Model
                var model_file_contents = FS.readFileSync(files[0], "utf8");
                expect(model_file_contents).to.include("module.exports = Bookshelf.model('Thing', {");
                expect(model_file_contents).to.include("tableName: 'things'");
                
                // Testing
                var testing_file_contents = FS.readFileSync(files[1], "utf8");
                expect(testing_file_contents).to.include("Testing.forgeThing = (details) => {");
                expect(testing_file_contents).to.include("Testing.createThing = (details) => {");
                expect(testing_file_contents).to.include("module.exports = Testing;");
                
                // Migration
                var migration_file_contents = FS.readFileSync(files[2], "utf8");
                expect(migration_file_contents).to.include('up (knex, Promise) {');
                expect(migration_file_contents).to.include("return knex.schema.createTable('things', (table) => {");
                expect(migration_file_contents).to.include('down (knex, Promise) {');
                expect(migration_file_contents).to.include("return knex.schema.dropTable('things');");
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
        
        
        lab.test('can generate only a model', (done) => {
            Generate.model(config, ['only-thing', '--no-migration']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(2);
                
                // Model
                var model_file_contents = FS.readFileSync(files[0], "utf8");
                expect(model_file_contents).to.include("module.exports = Bookshelf.model('OnlyThing', {");
                expect(model_file_contents).to.include("tableName: 'only_things'");
                
                // Testing
                var testing_file_contents = FS.readFileSync(files[1], "utf8");
                expect(testing_file_contents).to.include("Testing.forgeOnlyThing = (details) => {");
                expect(testing_file_contents).to.include("Testing.createOnlyThing = (details) => {");
                expect(testing_file_contents).to.include("module.exports = Testing;");
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
        
        
        lab.test('can generate only a migration', (done) => {
            Generate.model(config, ['thing', '--no-model']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(1);
                
                // Migration
                var migration_file_contents = FS.readFileSync(files[0], "utf8");
                expect(migration_file_contents).to.include('up (knex, Promise) {');
                expect(migration_file_contents).to.include("return knex.schema.createTable('things', (table) => {");
                expect(migration_file_contents).to.include('down (knex, Promise) {');
                expect(migration_file_contents).to.include("return knex.schema.dropTable('things');");
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
        
        
        lab.test('can generate nothing', (done) => {
            Generate.model(config, ['thing', '--no-model', '--no-migration']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(0);
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    
    
    lab.suite('routes', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/generate`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('fails with no arguments', (done) => {
            Generate.routes(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            });
        });
        
        
        lab.test('generates a new routes file, resource, and tests', (done) => {
            Generate.routes(config, ['thing']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(3);
                
                // Routes
                var route_file_contents = FS.readFileSync(files[0], "utf8");
                expect(route_file_contents).to.include("path: '/things',");
                
                // Route tests
                var test_file_contents = FS.readFileSync(files[1], "utf8");
                expect(test_file_contents).to.include("lab.experiment('things-routes', () => {");
                expect(test_file_contents).to.include("lab.suite('GET /things', () => {");
                
                // Resource
                var resource_file_contents = FS.readFileSync(files[2], "utf8");
                expect(resource_file_contents).to.include("module.exports.public = (thing) => {");
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
        
        
        lab.test('can generate just a route file', (done) => {
            Generate.routes(config, ['thing', '--no-tests', '--no-resource']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(1);
                
                // Routes
                var route_file_contents = FS.readFileSync(files[0], "utf8");
                expect(route_file_contents).to.include("path: '/things',");
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    
    
    lab.suite('resource', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp/app/server/resources`, () => {
                done();
            });
        });
        
        
        lab.test('fails with no arguments', (done) => {
            Generate.resource(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            });
        });
        
        
        lab.test('generates a new resource file', (done) => {
            Generate.resource(config, ['things']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(1);
                
                // Resource
                var route_file_contents = FS.readFileSync(files[0], "utf8");
                expect(route_file_contents).to.include("module.exports.public = (thing) => {");
                
                done();
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });
    
    
    lab.suite('endpoint', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/generate`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('can generate a resource route file', (done) => {
            Generate.endpoint(config, ['things']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(7);
                
                expect(files[0]).to.contain('app/server/models/thing.js');
                expect(files[1]).to.contain('test/testing.js');
                expect(files[2]).to.contain('_create-things.js');
                expect(files[3]).to.contain('app/server/routes/things-routes.js');
                expect(files[4]).to.contain('test/routes/things-routes-test.js');
                expect(files[5]).to.contain('app/server/resources/thing-resource.js');
                expect(files[6]).to.contain('app/server/prerequisites.js');
                
                done();
            });
        });
    });
    
    
    lab.suite('notifications', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp/app/server/notifications`, () => {
                FS.writeFileSync(`${__dirname}/../tmp/app/server/notifications/index.js`, '');
                done();
            });
        });
        
        
        lab.test('fails with no arguments', (done) => {
            Generate.notification(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            });
        });
        
        
        lab.test('generates a notification and its template', (done) => {
            Generate.notification(config, ['new-user']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(2);
                
                var notification_js_file_contents = FS.readFileSync(files[0], "utf8");
                expect(notification_js_file_contents).to.include("module.exports.newUser = (user, callback) => {");
                expect(notification_js_file_contents).to.include("Mailer.newUser(user.get('email'), 'newUser', { user: user.toJSON() }, callback);");
                
                expect(files[1]).to.match(/new\-user\.html$/);
                var notification_file_contents = FS.readFileSync(files[1], "utf8");
                expect(notification_file_contents).to.include("<p>This is a new-user notification.</p>");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                done();
            });
        });
    });
    
    
    lab.suite('actions', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp/app/client/actions`, () => {
                FS.mkdirs(`${__dirname}/../tmp/test/actions`, () => {
                    done();
                });
            });
        });
        
        
        lab.test('it fails with no arguments', (done) => {
            Generate.actions(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            });
        });
        
        
        lab.test('generates actions and tests', (done) => {
            Generate.actions(config, ['thing']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(2);
                
                // Action
                var actions_file_contents = FS.readFileSync(files[0], "utf8");
                expect(actions_file_contents).to.include("'LOADING_THINGS'");
                expect(actions_file_contents).to.include("'LOADING_THINGS_FAILED'");
                expect(actions_file_contents).to.include("'LOADED_THINGS'");
                expect(actions_file_contents).to.include("'LOADING_THING'");
                expect(actions_file_contents).to.include("'LOADING_THING_FAILED'");
                expect(actions_file_contents).to.include("'LOADED_THING'");
                expect(actions_file_contents).to.include("'CREATING_THING'");
                expect(actions_file_contents).to.include("'CREATING_THING_FAILED'");
                expect(actions_file_contents).to.include("'CREATED_THING'");
                expect(actions_file_contents).to.include("'UPDATING_THING'");
                expect(actions_file_contents).to.include("'UPDATING_THING_FAILED'");
                expect(actions_file_contents).to.include("'UPDATED_THING'");
                expect(actions_file_contents).to.include("'DELETING_THING'");
                expect(actions_file_contents).to.include("'DELETING_THING_FAILED'");
                expect(actions_file_contents).to.include("'DELETED_THING'");
                
                expect(actions_file_contents).to.include("loadThings () {");
                expect(actions_file_contents).to.include("loadedThings (things) {");
                expect(actions_file_contents).to.include("loadThing (slug) {");
                expect(actions_file_contents).to.include("loadedThing (thing) {");
                expect(actions_file_contents).to.include("createThing (payload) {");
                expect(actions_file_contents).to.include("createdThing (thing) {");
                expect(actions_file_contents).to.include("updateThing (slug, payload) {");
                expect(actions_file_contents).to.include("updatedThing (thing) {");
                expect(actions_file_contents).to.include("deleteThing (slug) {");
                expect(actions_file_contents).to.include("deletedThing (thing) {");
                
                // Test
                var test_file_contents = FS.readFileSync(files[1], "utf8");
                expect(test_file_contents).to.include("lab.experiment('Thing Actions', () => {");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                done();
            });
        });
        
        
        lab.test('can generate actions without tests', (done) => {
            Generate.actions(config, ['thing', '--no-tests']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(1);
                
                // Action
                var actions_file_contents = FS.readFileSync(files[0], "utf8");
                expect(actions_file_contents).to.include("'LOADING_THINGS'");
                expect(actions_file_contents).to.include("'LOADING_THING'");
                expect(actions_file_contents).to.include("'CREATING_THING'");
                expect(actions_file_contents).to.include("'UPDATING_THING'");
                
                expect(actions_file_contents).to.include("loadThings () {");
                expect(actions_file_contents).to.include("loadThing (slug) {");
                expect(actions_file_contents).to.include("createThing (payload) {");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                done();
            });
        });
    });
    
    
    lab.suite('reducer', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/generate`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('fails with no args', (done) => {
            Generate.reducer(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            })
        });
        
        
        lab.test('generates a reducer and tests', (done) => {
            Generate.reducer(config, ['things']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(3);
                
                // Reducer
                var reducer_file_contents = FS.readFileSync(files[0], "utf8");
                expect(reducer_file_contents).to.include("function things (state, action) {");
                
                // Adds reducer to the index
                var reducer_index_file_contents = FS.readFileSync(files[1], "utf8");
                expect(reducer_index_file_contents).to.include("const things = require('./things-reducer');");
                expect(reducer_index_file_contents).to.include("things,");
                
                // Test
                var test_file_contents = FS.readFileSync(files[2], "utf8");
                expect(test_file_contents).to.include("lab.experiment('Things Reducer:', () => {");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                expect(err).to.be.null();
                done();
            });
        });
        
        
        lab.test('can generate a reducer without tests', (done) => {
            Generate.reducer(config, ['things', '--no-tests']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(2);
                
                // Reducer
                var reducer_file_contents = FS.readFileSync(files[0], "utf8");
                expect(reducer_file_contents).to.include("function things (state, action) {");
                
                // Adds reducer to the index
                var reducer_index_file_contents = FS.readFileSync(files[1], "utf8");
                expect(reducer_index_file_contents).to.include("const things = require('./things-reducer');");
                expect(reducer_index_file_contents).to.include("things,");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                expect(err).to.be.null();
                done();
            });
        });
    });
    
    
    lab.suite('redux', () => {
        lab.beforeEach((done) => {
            FS.copy(`${__dirname}/generate`, `${__dirname}/../tmp`, (err) => {
                done();
            });
        });
        
        
        lab.test('generates actions and a reducer', (done) => {
            Generate.redux(config, ['things']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(5);
                
                // Actions
                expect(files[0]).to.match(/\-actions\.js$/);
                expect(files[1]).to.match(/\-actions\-test\.js/);
                
                // Reducer
                expect(files[2]).to.match(/\-reducer\.js/);
                expect(files[3]).to.match(/reducers\/index\.js/);
                expect(files[4]).to.match(/\-reducer\-test\.js/);
                
                done();
            });
        });
    });
    
    
    lab.suite('component', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp/app/client/components`, () => {
                FS.mkdirs(`${__dirname}/../tmp/app/assets/styles`, () => {
                    FS.mkdirs(`${__dirname}/../tmp/test/components`, () => {
                        done();
                    });
                });
            });
        });
        
        
        lab.test('fails with no args', (done) => {
            Generate.component(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            });
        });
        
        
        lab.test('generates a component and tests', (done) => {
            Generate.component(config, ['thing']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(3);
                
                // Component
                var component_file_contents = FS.readFileSync(files[0], "utf8");
                expect(component_file_contents).to.include("class Thing extends React.Component {");
                
                // Test
                var test_file_contents = FS.readFileSync(files[1], "utf8");
                expect(test_file_contents).to.include('lab.experiment("Thing:", () => {');
                expect(test_file_contents).to.include('shallow(');
                
                // Style
                var style_file_contents = FS.readFileSync(files[2], "utf8");
                expect(style_file_contents).to.include(".wrapper {}");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                done();
            });
        });
        
        
        lab.test('generates a component and mounted tests', (done) => {
            Generate.component(config, ['thing', 'with-provider']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(3);
                
                // Component
                var component_file_contents = FS.readFileSync(files[0], "utf8");
                expect(component_file_contents).to.include("class Thing extends React.Component {");
                
                // Test
                var test_file_contents = FS.readFileSync(files[1], "utf8");
                expect(test_file_contents).to.include('lab.experiment("Thing:", () => {');
                expect(test_file_contents).to.include('mount(');
                expect(test_file_contents).to.include('<Provider');
                
                // Style
                var style_file_contents = FS.readFileSync(files[2], "utf8");
                expect(style_file_contents).to.include(".wrapper {}");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                done();
            });
        });
    });
    
    
    lab.suite('styles', () => {
        lab.beforeEach((done) => {
            FS.mkdirs(`${__dirname}/../tmp/app/assets/styles`, () => {
                done();
            });
        });
        
        
        lab.test('fails with no args', (done) => {
            Generate.style(config, []).catch((err) => {
                expect(err).to.be.an.error();
                done();
            });
        });
        
        
        lab.test('generates a stylesheet', (done) => {
            Generate.style(config, ['thing']).then((files) => {
                expect(files).to.be.an.array();
                expect(files.length).to.equal(1);
                
                // Style
                var style_file_contents = FS.readFileSync(files[0], "utf8");
                expect(style_file_contents).to.include(".wrapper {}");
                
                done();
            }).catch((err) => {
                console.log(err.stack);
                done();
            });
        });
    });
});

const Module = require('module');

const _ = require('lodash');
const Values = require('test-values');
const configureStore = require('redux-mock-store').default;
const Thunk = require('redux-thunk').default;
const Gimmea = require('gimmea');
const Nock = require('nock');
const KnexCleaner = require('knex-cleaner');

const mockStore = configureStore([Thunk]);


module.exports = () => {
    // Mock out `require()` to fake CSS and images
    var originalLoader = Module._load;

    function mockedLoader (path, parent, is_main) {
        if (path.match(/\.(png|jpg|jpeg|gif)$/)) {
            return {};
        }
        
        if (path.match(/\.css$/)) {
            return new Proxy({}, {
                get: (styles, method) => {
                    return method;
                }
            });
        }
        
        return originalLoader(path, parent, is_main);
    }
    
    Module._load = mockedLoader;
    
    
    const Helpers = {
        emptyDatabase (knex) {
            return KnexCleaner.clean(knex, { ignoreTables: ['schema_migrations', 'schema_migrations_lock'] });
        },
        
        
        mockStore (state) {
            return mockStore(state);
        },
        
        
        mockURL (url) {
            return Nock(url);
        },
        
        
        uuid () {
            return Gimmea.uuid();
        }
    }
    
    
    return Helpers;
}
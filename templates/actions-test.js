const Lab = require('lab');
const Nock = require('nock');
const Testing = require('../testing');
const Immutable = require('immutable');
const {{SINGLE_CLASS}}Resource = require('app/server/resources/{{SINGLE_LOWERCASE}}-resource');

const { expect } = require('code');
const lab = exports.lab = Lab.script();

const URL = 'http://test.com';
Testing.mockDom(URL);

const Actions = require('app/client/actions/{{SINGLE_LOWERCASE}}-actions');


lab.experiment('{{SINGLE_CLASS}} Actions', () => {
    var store;
    var {{PLURAL_LOWERCASE}};
    
    
    lab.beforeEach((done) => {
        store = Testing.mockStore(Immutable.fromJS({
            {{PLURAL_LOWERCASE}}: {
                is_loading_{{PLURAL_LOWERCASE}}: false,
                {{PLURAL_LOWERCASE}}_error: null,
                is_loading_{{SINGLE_LOWERCASE}}: false,
                is_creating_{{SINGLE_LOWERCASE}}: false,
                {{SINGLE_LOWERCASE}}_error: null,
                by_id: {}
            }
        }));
        
        {{PLURAL_LOWERCASE}} = [
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()),
        ];
        
        done();
    });
    
    
    lab.afterEach((done) => {
        Nock.cleanAll();
        done();
    });
    
    
    lab.test('can load {{PLURAL_LOWERCASE}}', (done) => {
        Nock(URL).get('/app/{{PLURAL_LOWERCASE}}').reply(200, {{PLURAL_LOWERCASE}});
        
        store.dispatch(Actions.load{{PLURAL_CLASS}}()).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.LOADING_{{PLURAL_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADED_{{PLURAL_CONSTANT}});
            expect(actions[1].payload.count()).to.equal({{PLURAL_LOWERCASE}}.length);
                
            done();
        });
    });
    
    
    lab.test('loading {{PLURAL_LOWERCASE}} can fail', (done) => {
        Nock(URL).get('/app/{{PLURAL_LOWERCASE}}').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Loading {{PLURAL_LOWERCASE}} failed' });
        
        store.dispatch(Actions.load{{PLURAL_CLASS}}()).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.LOADING_{{PLURAL_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADED_{{PLURAL_CONSTANT}});
            expect(actions[1].error).to.be.an.instanceof(Error);
                
            done();
        });
    });
    
    
    lab.test('can load a {{SINGLE_LOWERCASE}}', (done) => {
        Nock(URL).get('/app/{{PLURAL_LOWERCASE}}/x').reply(200, {{PLURAL_LOWERCASE}}[0]);
        
        store.dispatch(Actions.load{{SINGLE_CLASS}}('x')).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.LOADING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADED_{{SINGLE_CONSTANT}});
            expect(actions[1].payload.get('name')).to.equal({{PLURAL_LOWERCASE}}[0].name);
                
            done();
        });
    });
    
    
    lab.test('loading a {{SINGLE_LOWERCASE}} can fail', (done) => {
        Nock(URL).get('/app/{{PLURAL_LOWERCASE}}/x').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Loading {{SINGLE_LOWERCASE}} failed' });
        
        store.dispatch(Actions.load{{SINGLE_CLASS}}('x')).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.LOADING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADED_{{SINGLE_CONSTANT}});
            expect(actions[1].error).to.be.an.instanceof(Error);
                
            done();
        });
    });
    
    
    lab.test('can create a new {{SINGLE_LOWERCASE}}', (done) => {
        let new_{{SINGLE_LOWERCASE}} = {
            name: 'New {{SINGLE_CLASS}}'
        };
        
        Nock(URL).post('/app/{{PLURAL_LOWERCASE}}').reply(200, {{SINGLE_CLASS}}Resource.public(new_{{SINGLE_LOWERCASE}}));
        
        store.dispatch(Actions.create{{SINGLE_CLASS}}(new_{{SINGLE_LOWERCASE}})).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.CREATING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.CREATED_{{SINGLE_CONSTANT}});
            expect(actions[1].payload).to.be.an.object();
            
            done();
        });
    });
    
    
    lab.test('creating {{SINGLE_LOWERCASE}} can fail', (done) => {
        let new_{{SINGLE_LOWERCASE}} = {
            name: 'New {{SINGLE_CLASS}}'
        };
        
        Nock(URL).post('/app/{{PLURAL_LOWERCASE}}').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Creating {{SINGLE_LOWERCASE}} failed' });
        
        store.dispatch(Actions.create{{SINGLE_CLASS}}(new_{{SINGLE_LOWERCASE}})).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.CREATING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.CREATED_{{SINGLE_CONSTANT}});
                
            done();
        });
    });
    
    
    lab.test('can update a given {{SINGLE_LOWERCASE}}', (done) => {
        let updating_{{SINGLE_LOWERCASE}} = {
            name: 'Updated {{SINGLE_CLASS}}'
        };
        
        Nock(URL).put('/app/{{PLURAL_LOWERCASE}}/slug').reply(200, {{SINGLE_CLASS}}Resource.public(updating_{{SINGLE_LOWERCASE}}));
        
        store.dispatch(Actions.update{{SINGLE_CLASS}}('slug', updating_{{SINGLE_LOWERCASE}})).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.UPDATING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.UPDATED_{{SINGLE_CONSTANT}});
            expect(actions[1].payload).to.be.an.object();
            
            done();
        });
    });
    
    
    lab.test('updating a given {{SINGLE_LOWERCASE}} can fail', (done) => {
        let updating_{{SINGLE_LOWERCASE}} = {
            name: 'Updated {{SINGLE_CLASS}}'
        };
        
        Nock(URL).put('/app/{{PLURAL_LOWERCASE}}/slug').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Updating {{SINGLE_LOWERCASE}} failed' });
        
        store.dispatch(Actions.update{{SINGLE_CLASS}}(updating_{{SINGLE_LOWERCASE}})).then(() => {
            let actions = store.getActions();
            
            expect(actions[0].type).to.equal(Actions.UPDATING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.UPDATED_{{SINGLE_CONSTANT}});
            expect(actions[1].error).to.be.an.instanceof(Error)
                
            done();
        });
    });
    
    
    lab.test('can delete a given {{SINGLE_LOWERCASE}}', (done) => {
        Nock(URL).delete('/app/{{PLURAL_LOWERCASE}}/slug').reply(200, {});
        
        store.dispatch(Actions.delete{{SINGLE_CLASS}}('slug')).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
            expect(actions[0].type).to.equal(Actions.DELETING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.DELETED_{{SINGLE_CONSTANT}});
            expect(actions[1].payload).to.be.an.object();
            
            done();
        });
    });
    
    
    lab.test('deleting a given {{SINGLE_LOWERCASE}} can fail', (done) => {
        Nock(URL).delete('/app/{{PLURAL_LOWERCASE}}/slug').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Deleting {{SINGLE_LOWERCASE}} failed' });
        
        store.dispatch(Actions.delete{{SINGLE_CLASS}}('slug')).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
            expect(actions[0].type).to.equal(Actions.DELETING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.DELETED_{{SINGLE_CONSTANT}});
            expect(actions[1].error).to.be.an.instanceof(Error);
                
            done();
        });
    });
});

const Lab = require('lab');
const Nock = require('nock');
const Helpers = require('../helpers');
const Immutable = require('immutable');
const Config = require('app/config/public');
const {{SINGLE_CLASS}}Resource = require('app/server/resources/{{SINGLE_LOWERCASE}}-resource');

const { expect } = require('code');
const lab = exports.lab = Lab.script();


const Actions = require('app/client/actions/{{SINGLE_LOWERCASE}}-actions');


lab.experiment('{{SINGLE_CLASS}} Actions', () => {
    var store;
    var {{PLURAL_LOWERCASE}};
    
    
    lab.beforeEach((done) => {
        store = Helpers.mockStore(Immutable.fromJS({
            is_loading_{{PLURAL_LOWERCASE}}: false,
            {{PLURAL_LOWERCASE}}_error: null,
            is_loading_{{SINGLE_LOWERCASE}}: false,
            is_creating_{{SINGLE_LOWERCASE}}: false,
            {{SINGLE_LOWERCASE}}_error: null,
            by_slug: {}
        }));
        
        {{PLURAL_LOWERCASE}} = [
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}()),
        ];
        
        done();
    });
    
    
    lab.afterEach((done) => {
        Nock.cleanAll();
        done();
    });
    
    
    lab.test('it can load {{PLURAL_LOWERCASE}}', (done) => {
        Nock(Config.URL).get('/app/{{PLURAL_LOWERCASE}}').reply(200, groups);
        
        store.dispatch(Actions.load{{PLURAL_CLASS}}()).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
            expect(actions[0].type).to.equal(Actions.LOADING_{{PLURAL_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADED_{{PLURAL_CONSTANT}});
            expect(actions[1].payload.length).to.equal({{SINGLE_LOWERCASE}}.length);
                
            done();
        });
    });
    
    
    lab.test('loading {{PLURAL_LOWERCASE}} can fail', (done) => {
        Nock(Config.URL).get('/app/{{PLURAL_LOWERCASE}}').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Loading {{PLURAL_LOWERCASE}} failed' });
        
        store.dispatch(Actions.load{{PLURAL_CLASS}}()).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
            expect(actions[0].type).to.equal(Actions.LOADING_{{PLURAL_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADING_{{PLURAL_CONSTANT}}_FAILED);
                
            done();
        });
    });
    
    
    lab.test('it can load a {{SINGLE_LOWERCASE}}', (done) => {
        Nock(Config.URL).get('/app/{{PLURAL_LOWERCASE}}/x').reply(200, {{PLURAL_LOWERCASE}}[0]);
        
        store.dispatch(Actions.loadGroup('x')).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
            expect(actions[0].type).to.equal(Actions.LOADING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADED_{{SINGLE_CONSTANT}});
            expect(actions[1].payload.name).to.equal({{PLURAL_LOWERCASE}}[0].name);
                
            done();
        });
    });
    
    
    lab.test('loading a {{SINGLE_LOWERCASE}} can fail', (done) => {
        Nock(Config.URL).get('/app/{{PLURAL_LOWERCASE}}/x').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Loading {{SINGLE_LOWERCASE}} failed' });
        
        store.dispatch(Actions.load{{SINGLE_CLASS}}('x')).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
            expect(actions[0].type).to.equal(Actions.LOADING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.LOADING_{{SINGLE_CONSTANT}}_FAILED);
                
            done();
        });
    });
    
    
    lab.test('it can create a {{SINGLE_LOWERCASE}}', (done) => {
        let new_{{SINGLE_LOWERCASE}} = {
            name: 'New {{SINGLE_CLASS}}'
        };
        
        Nock(Config.URL).post('/app/{{PLURAL_LOWERCASE}}').reply(200, GroupResource.member(new_{{SINGLE_LOWERCASE}}));
        
        store.dispatch(Actions.create{{SINGLE_CLASS}}(new_{{SINGLE_LOWERCASE}})).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
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
        
        Nock(Config.URL).post('/app/{{PLURAL_LOWERCASE}}').reply(400, { statusCode: 400, error: 'Bad Request', message: 'Creating {{SINGLE_LOWERCASE}} failed' });
        
        store.dispatch(Actions.create{{SINGLE_CLASS}}(new_{{SINGLE_LOWERCASE}})).then(() => {
            let actions = store.getActions();
            
            expect(actions.length).to.equal(2);
            expect(actions[0].type).to.equal(Actions.CREATING_{{SINGLE_CONSTANT}});
            expect(actions[1].type).to.equal(Actions.CREATING_{{SINGLE_CONSTANT}}_FAILED);
                
            done();
        });
    });
});
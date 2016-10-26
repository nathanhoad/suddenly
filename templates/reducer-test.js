const Lab = require('lab');
const Immutable = require('immutable');
const Helpers = require('../helpers');
const _ = require('lodash');

const { expect } = require('code');
const lab = exports.lab = Lab.script();

const {{SINGLE_CLASS}}Actions = require('app/client/actions/{{SINGLE_LOWERCASE}}-actions');
const {{SINGLE_CLASS}}Resource = require('app/server/resources/{{SINGLE_LOWERCASE}}-resource');
const reducer = require('app/client/reducers/{{PLURAL_LOWERCASE}}-reducer');


lab.experiment('{{PLURAL_CLASS}} Reducer:', () => {
    var {{PLURAL_LOWERCASE}};
    var initial_state;
    
    
    lab.beforeEach((done) => {
        {{PLURAL_LOWERCASE}} = [
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}())
        ];
        
        initial_state = Immutable.fromJS({
            is_loading_{{PLURAL_LOWERCASE}}: false,
            {{PLURAL_LOWERCASE}}_error: null,
            is_loading_{{SINGLE_LOWERCASE}}: false,
            is_creating_{{SINGLE_LOWERCASE}}: false,
            {{SINGLE_LOWERCASE}}_error: null,
            by_slug: _.keyBy({{PLURAL_LOWERCASE}}, 'slug')
        });
        done();
    });
    
    
    lab.test("it should handle initial state", (done) => {
        let state = reducer(undefined, {});
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal(0);
        
        done();
    });
    
    
    lab.test("it should handle LOADING_{{PLURAL_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.true();
        expect(state.get('by_slug').count()).to.equal(0);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.true();
        expect(state.get('by_slug').count()).to.equal({{PLURAL_LOWERCASE}}.length);
        
        done();
    });
    
    
    lab.test("it should handle LOADED_{{PLURAL_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}, payload: {{PLURAL_LOWERCASE}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).equal({{PLURAL_LOWERCASE}}.length);
        
        let loaded_{{PLURAL_LOWERCASE}} = [
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}())
        ]
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}, payload: loaded_{{PLURAL_LOWERCASE}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).equal(loaded_{{PLURAL_LOWERCASE}}.length);
        
        done();
    });
    
    
    lab.test("it should handle LOADING_{{PLURAL_CONSTANT}}_FAILED", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}}_FAILED, payload: new Error('Error') });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal(0);
        expect(state.get('{{PLURAL_LOWERCASE}}_error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}}_FAILED, payload: new Error('Error') });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal({{PLURAL_LOWERCASE}}.length);
        expect(state.get('{{PLURAL_LOWERCASE}}_error').message).to.equal('Error');
        
        done();
    });
    
    
    lab.test("it should handle LOADING_{{SINGLE_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.true();
        expect(state.get('by_slug').count()).to.equal(0);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.true();
        expect(state.get('by_slug').count()).to.equal({{PLURAL_LOWERCASE}}.length);
        
        done();
    });
    
    
    lab.test("it should handle LOADED_{{SINGLE_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}, payload: {{PLURAL_LOWERCASE}}[0] });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).equal(1);
        
        let loaded_{{SINGLE_LOWERCASE}} = {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}());
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}, payload: loaded_{{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).equal({{PLURAL_LOWERCASE}}.length + 1);
        
        done();
    });
    
    
    lab.test("it should handle LOADING_{{SINGLE_CONSTANT}}_FAILED", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}}_FAILED, payload: new Error('Error') });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal(0);
        expect(state.get('{{SINGLE_LOWERCASE}}_error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}}_FAILED, payload: new Error('Error') });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal({{PLURAL_LOWERCASE}}.length);
        expect(state.get('{{SINGLE_LOWERCASE}}_error').message).to.equal('Error');
        
        done();
    });
    
    
    lab.test("it should handle CREATING_{{SINGLE_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.CREATING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.true();
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.CREATING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.true();
        
        done();
    });
    
    
    lab.test("it should handle CREATED_{{SINGLE_CONSTANT}}", (done) => {
        let {{SINGLE_LOWERCASE}} = {{SINGLE_CLASS}}Resource.member(Helpers.forge{{SINGLE_CLASS}}());
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal(1);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal({{PLURAL_LOWERCASE}}.length + 1);
        
        done();
    });
    
    
    lab.test("it should handle CREATING_{{SINGLE_CONSTANT}}_FAILED", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.CREATING_{{SINGLE_CONSTANT}}_FAILED, payload: new Error('Error') });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal(0);
        expect(state.get('{{SINGLE_LOWERCASE}}_error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.CREATING_{{SINGLE_CONSTANT}}_FAILED, payload: new Error('Error') });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_slug').count()).to.equal({{PLURAL_LOWERCASE}}.length);
        expect(state.get('{{SINGLE_LOWERCASE}}_error').message).to.equal('Error');
        
        done();
    });
});
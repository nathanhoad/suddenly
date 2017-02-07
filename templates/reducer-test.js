const Lab = require('lab');
const Immutable = require('immutable');
const Testing = require('../testing');
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
        {{PLURAL_LOWERCASE}} = Immutable.fromJS([
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}())
        ]);
        
        initial_state = Immutable.fromJS({
            is_loading_{{PLURAL_LOWERCASE}}: false,
            is_loading_{{SINGLE_LOWERCASE}}: false,
            is_creating_{{SINGLE_LOWERCASE}}: false,
            is_updating_{{SINGLE_LOWERCASE}}: false,
            is_deleting_{{SINGLE_LOWERCASE}}: false,
            error: null,
            by_id: Immutable.Map({{PLURAL_LOWERCASE}}.map(i => [i.get('id'), i]))
        });
        done();
    });
    
    
    lab.test("it should handle initial state", (done) => {
        let state = reducer(undefined, {});
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(0);
        
        done();
    });
    
    
    lab.test("it should handle LOADING_{{PLURAL_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.true();
        expect(state.get('by_id').count()).to.equal(0);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.true();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        
        done();
    });
    
    
    lab.test("it should handle LOADED_{{PLURAL_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}, payload: {{PLURAL_LOWERCASE}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).equal({{PLURAL_LOWERCASE}}.count());
        
        let loaded_{{PLURAL_LOWERCASE}} = Immutable.fromJS([
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()),
            {{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}())
        ]);
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}, payload: loaded_{{PLURAL_LOWERCASE}} });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).equal(loaded_{{PLURAL_LOWERCASE}}.count());
        
        done();
    });
    
    
    lab.test("it should handle LOADED_{{PLURAL_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(0);
        expect(state.get('error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_loading_{{PLURAL_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        expect(state.get('error').message).to.equal('Error');
        
        done();
    });
    
    
    lab.test("it should handle LOADING_{{SINGLE_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.true();
        expect(state.get('by_id').count()).to.equal(0);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.true();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        
        done();
    });
    
    
    lab.test("it should handle LOADED_{{SINGLE_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}, payload: {{PLURAL_LOWERCASE}}.first() });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).equal(1);
        
        let loaded_{{SINGLE_LOWERCASE}} = Immutable.fromJS({{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()));
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}, payload: loaded_{{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).equal({{PLURAL_LOWERCASE}}.count() + 1);
        
        done();
    });
    
    
    lab.test("it should handle LOADED_{{SINGLE_CONSTANT}} failing", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(0);
        expect(state.get('error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_loading_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        expect(state.get('error').message).to.equal('Error');
        
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
        let {{SINGLE_LOWERCASE}} = Immutable.fromJS({{SINGLE_CLASS}}Resource.public(Testing.forge{{SINGLE_CLASS}}()));
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(1);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count() + 1);
        
        done();
    });
    
    
    lab.test("it should handle CREATED_{{SINGLE_CONSTANT}} failing", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(0);
        expect(state.get('error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_creating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        expect(state.get('error').message).to.equal('Error');
        
        done();
    });
    
    
    lab.test("it should handle UPDATING_{{SINGLE_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.UPDATING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_updating_{{SINGLE_LOWERCASE}}')).to.be.true();
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.UPDATING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_updating_{{SINGLE_LOWERCASE}}')).to.be.true();
        
        done();
    });
    
    
    lab.test("it should handle UPDATED_{{SINGLE_CONSTANT}}", (done) => {
        let {{SINGLE_LOWERCASE}} = {{PLURAL_LOWERCASE}}.first();
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.UPDATED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_updating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(1);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.UPDATED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_updating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        
        done();
    });
    
    
    lab.test("it should handle UPDATED_{{SINGLE_CONSTANT}} failing", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.UPDATED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_updating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(0);
        expect(state.get('error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.UPDATED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_updating_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        expect(state.get('error').message).to.equal('Error');
        
        done();
    });
    
    
    lab.test("it should handle DELETING_{{SINGLE_CONSTANT}}", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.DELETING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_deleting_{{SINGLE_LOWERCASE}}')).to.be.true();
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.DELETING_{{SINGLE_CONSTANT}} });
        
        expect(state.get('is_deleting_{{SINGLE_LOWERCASE}}')).to.be.true();
        
        done();
    });
    
    
    lab.test("it should handle DELETED_{{SINGLE_CONSTANT}}", (done) => {
        let {{SINGLE_LOWERCASE}} = {{PLURAL_LOWERCASE}}.first();
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.DELETED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_deleting_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(0);
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.DELETED_{{SINGLE_CONSTANT}}, payload: {{SINGLE_LOWERCASE}} });
        
        expect(state.get('is_deleting_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count() - 1);
        
        done();
    });
    
    
    lab.test("it should handle DELETED_{{SINGLE_CONSTANT}} failing", (done) => {
        let state = reducer(undefined, { type: {{SINGLE_CLASS}}Actions.DELETED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_deleting_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal(0);
        expect(state.get('error').message).to.equal('Error');
        
        state = reducer(initial_state, { type: {{SINGLE_CLASS}}Actions.DELETED_{{SINGLE_CONSTANT}}, error: new Error('Error') });
        
        expect(state.get('is_deleting_{{SINGLE_LOWERCASE}}')).to.be.false();
        expect(state.get('by_id').count()).to.equal({{PLURAL_LOWERCASE}}.count());
        expect(state.get('error').message).to.equal('Error');
        
        done();
    });
});

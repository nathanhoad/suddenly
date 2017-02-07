const { reducer } = require('suddenly-redux');
const Immutable = require('immutable');
const {{SINGLE_CLASS}}Actions = require('app/client/actions/{{SINGLE_LOWERCASE}}-actions');


const initial_state = Immutable.fromJS({
    is_loading_{{PLURAL_LOWERCASE}}: false,
    is_loading_{{SINGLE_LOWERCASE}}: false,
    is_creating_{{SINGLE_LOWERCASE}}: false,
    is_updating_{{SINGLE_LOWERCASE}}: false,
    is_deleting_{{SINGLE_LOWERCASE}}: false,
    error: null,
    by_id: {}
});

    
module.exports = reducer(initial_state, {
    [{{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_loading_{{PLURAL_LOWERCASE}}: true
        });
    },
    
        
    [{{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_loading_{{PLURAL_LOWERCASE}}: false,
            error: action.error,
            by_id: action.error ? state.get('by_id') : Immutable.Map(action.payload.map(i => [i.get('id'), i]))
        });
    },
    
    
    [{{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_loading_{{SINGLE_LOWERCASE}}: true
        });
    },
    
    
    [{{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_loading_{{SINGLE_LOWERCASE}}: false,
            error: action.error,
            by_id: action.error ? state.get('by_id') : state.get('by_id').set(action.payload.get('id'), action.payload)
        });
    },
    
    
    [{{SINGLE_CLASS}}Actions.CREATING_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_creating_{{SINGLE_LOWERCASE}}: true
        });
    },
    
    
    [{{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_creating_{{SINGLE_LOWERCASE}}: false,
            error: action.error,
            by_id: action.error ? state.get('by_id') : state.get('by_id').set(action.payload.get('id'), action.payload)
        });
    },
    
    
    [{{SINGLE_CLASS}}Actions.UPDATING_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_updating_{{SINGLE_LOWERCASE}}: true
        });
    },
    
    
    [{{SINGLE_CLASS}}Actions.UPDATED_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_updating_{{SINGLE_LOWERCASE}}: false,
            error: action.error,
            by_id: action.error ? state.get('by_id') : state.get('by_id').set(action.payload.get('id'), action.payload)
        });
    },
    

    [{{SINGLE_CLASS}}Actions.DELETING_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_deleting_{{SINGLE_LOWERCASE}}: true
        });
    },
    
    
    [{{SINGLE_CLASS}}Actions.DELETED_{{SINGLE_CONSTANT}}]: (state, action) => {
        return state.merge({
            is_deleting_{{SINGLE_LOWERCASE}}: false,
            error: action.error,
            by_id: action.error ? state.get('by_id') : state.get('by_id').delete(action.payload.get('id'))
        });
    }
});

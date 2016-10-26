const Immutable = require('immutable');
const {{SINGLE_CLASS}}Actions = require('app/client/actions/{{SINGLE_LOWERCASE}}-actions');
const keyBy = require('lodash/keyBy');


const initial_state = Immutable.fromJS({
    is_loading_{{PLURAL_LOWERCASE}}: false,
    {{PLURAL_LOWERCASE}}_error: null,
    is_loading_{{SINGLE_LOWERCASE}}: false,
    is_creating_{{SINGLE_LOWERCASE}}: false,
    {{SINGLE_LOWERCASE}}_error: null,
    by_slug: {}
});


function {{SINGLE_LOWERCASE}} (state, action) {
    if (!state) state = initial_state;
    
    switch (action.type) {
        case {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}}:
            return state.merge({
                is_loading_{{PLURAL_LOWERCASE}}: true
            });
        
        case {{SINGLE_CLASS}}Actions.LOADING_{{PLURAL_CONSTANT}}_FAILED:
            return state.merge({
                is_loading_{{PLURAL_LOWERCASE}}: false,
                {{PLURAL_LOWERCASE}}_error: action.payload
            });
        
        case {{SINGLE_CLASS}}Actions.LOADED_{{PLURAL_CONSTANT}}:
            return state.merge({
                is_loading_{{PLURAL_LOWERCASE}}: false,
                {{PLURAL_LOWERCASE}}_error: null,
                by_slug: Immutable.fromJS(keyBy(action.payload, 'slug'))
            });
        
        case {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}}:
            return state.merge({
                is_loading_{{SINGLE_LOWERCASE}}: true
            });
        
        case {{SINGLE_CLASS}}Actions.LOADING_{{SINGLE_CONSTANT}}_FAILED:
            return state.merge({
                is_loading_{{SINGLE_LOWERCASE}}: false,
                {{SINGLE_LOWERCASE}}_error: action.payload
            });
        
        case {{SINGLE_CLASS}}Actions.LOADED_{{SINGLE_CONSTANT}}:
            let loaded_{{SINGLE_LOWERCASE}} = Immutable.fromJS(action.payload);
            state = state.setIn(['by_slug', loaded_{{SINGLE_LOWERCASE}}.get('slug')], loaded_{{SINGLE_LOWERCASE}});
            return state.merge({
                is_loading_{{SINGLE_LOWERCASE}}: false,
                {{SINGLE_LOWERCASE}}_error: null
            });
        
        case {{SINGLE_CLASS}}Actions.CREATING_{{SINGLE_CONSTANT}}:
            return state.merge({
                is_creating_{{SINGLE_LOWERCASE}}: true
            });
        
        case {{SINGLE_CLASS}}Actions.CREATING_{{SINGLE_CONSTANT}}_FAILED:
            return state.merge({
                is_creating_{{SINGLE_LOWERCASE}}: false,
                {{SINGLE_LOWERCASE}}_error: action.payload
            });
        
        case {{SINGLE_CLASS}}Actions.CREATED_{{SINGLE_CONSTANT}}:
            let created_{{SINGLE_LOWERCASE}} = Immutable.fromJS(action.payload);
            state = state.setIn(['by_slug', created_{{SINGLE_LOWERCASE}}.get('slug')], created_{{SINGLE_LOWERCASE}});
            return state.merge({
                is_creating_{{SINGLE_LOWERCASE}}: false,
                {{SINGLE_LOWERCASE}}_error: null
            });
        
        default:
            return state;
    }
}


module.exports = {{PLURAL_LOWERCASE}};
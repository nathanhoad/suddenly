const Tokeys = require('tokeys');
const merge = require('lodash/merge');
const API = require('app/client/api');


const Constants = Tokeys([
    'LOADING_{{PLURAL_CONSTANT}}',
    'LOADING_{{PLURAL_CONSTANT}}_FAILED',
    'LOADED_{{PLURAL_CONSTANT}}',
    
    'LOADING_{{SINGLE_CONSTANT}}',
    'LOADING_{{SINGLE_CONSTANT}}_FAILED',
    'LOADED_{{SINGLE_CONSTANT}}',
    
    'CREATING_{{SINGLE_CONSTANT}}',
    'CREATING_{{SINGLE_CONSTANT}}_FAILED',
    'CREATED_{{SINGLE_CONSTANT}}',
    
    'UPDATING_{{SINGLE_CONSTANT}}',
    'UPDATING_{{SINGLE_CONSTANT}}_FAILED',
    'UPDATED_{{SINGLE_CONSTANT}}'
]);


const Actions = {
    load{{PLURAL_CLASS}} () {
        return (dispatch, getState) => {
            let state = getState();
            if (state.getIn(['{{PLURAL_LOWERCASE}}', 'is_loading_{{PLURAL_LOWERCASE}}'])) return;
            
            dispatch({ type: Constants.LOADING_{{PLURAL_CONSTANT}} });
            
            return API.get('/app/{{PLURAL_LOWERCASE}}').then(({{PLURAL_LOWERCASE}}) => {
                dispatch(Actions.loaded{{PLURAL_CLASS}}({{PLURAL_LOWERCASE}}));
            }).catch((err) => {
                dispatch({ type: Constants.LOADING_{{PLURAL_CONSTANT}}_FAILED, payload: err });
            });
        }
    },
    
    
    loaded{{PLURAL_CLASS}} ({{PLURAL_LOWERCASE}}) {
        return { 
            type: Constants.LOADED_{{PLURAL_CONSTANT}}, 
            payload: {{PLURAL_LOWERCASE}} 
        }
    },
    
    
    load{{SINGLE_CLASS}} (slug) {
        return (dispatch, getState) => {
            let state = getState();
            if (state.getIn(['{{PLURAL_LOWERCASE}}', 'is_loading_{{SINGLE_LOWERCASE}}'])) return;
            
            dispatch({ type: Constants.LOADING_{{SINGLE_CONSTANT}} });
            
            return API.get(`/app/{{PLURAL_LOWERCASE}}/${slug}`).then(({{SINGLE_LOWERCASE}}) => {
                dispatch(Actions.loaded{{SINGLE_CLASS}}({{SINGLE_LOWERCASE}}));
            }).catch((err) => {
                dispatch({ type: Constants.LOADING_{{SINGLE_CONSTANT}}_FAILED, payload: err });
            });
        }
    },
    
    
    loaded{{SINGLE_CLASS}} ({{SINGLE_LOWERCASE}}) {
        return {
            type: Constants.LOADED_{{SINGLE_CONSTANT}},
            payload: {{SINGLE_LOWERCASE}}
        }
    },
    
    
    create{{SINGLE_CLASS}} (payload) {
        return (dispatch, getState) => {
            dispatch({ type: Constants.CREATING_{{SINGLE_CONSTANT}} });
            
            return API.post('/app/{{PLURAL_LOWERCASE}}', payload).then(({{SINGLE_LOWERCASE}}) => {
                dispatch(Actions.created{{SINGLE_CLASS}}({{SINGLE_LOWERCASE}}));
            }).catch((err) => {
                dispatch({ type: Constants.CREATING_{{SINGLE_CONSTANT}}_FAILED, payload: err });
            });
        }
    },
    
    
    created{{SINGLE_CLASS}} ({{SINGLE_LOWERCASE}}) {
        return {
            type: Constants.CREATED_{{SINGLE_CONSTANT}},
            payload: {{SINGLE_LOWERCASE}}
        }
    }
};


module.exports = merge(Constants, Actions);
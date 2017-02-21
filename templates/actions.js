const { constants } = require('suddenly-redux');
const Immutable = require('immutable');
const API = require('app/client/api');


const Actions = constants([
    'LOADING_{{PLURAL_CONSTANT}}',
    'LOADED_{{PLURAL_CONSTANT}}',
    
    'LOADING_{{SINGLE_CONSTANT}}',
    'LOADED_{{SINGLE_CONSTANT}}',
    
    'CREATING_{{SINGLE_CONSTANT}}',
    'CREATED_{{SINGLE_CONSTANT}}',
    
    'UPDATING_{{SINGLE_CONSTANT}}',
    'UPDATED_{{SINGLE_CONSTANT}}',
    
    'DELETING_{{SINGLE_CONSTANT}}',
    'DELETED_{{SINGLE_CONSTANT}}'
]);


Actions.load{{PLURAL_CLASS}} = () => {
    return (dispatch, getState) => {
        let state = getState();
        if (state.getIn(['{{PLURAL_LOWERCASE}}', 'is_loading_{{PLURAL_LOWERCASE}}'])) return;
        
        dispatch({ type: Actions.LOADING_{{PLURAL_CONSTANT}} });
        
        return API.get('/app/{{PLURAL_LOWERCASE_DASHED}}').then(({{PLURAL_LOWERCASE}}) => {
            {{PLURAL_LOWERCASE}} = Immutable.fromJS({{PLURAL_LOWERCASE}});
            dispatch(Actions.loaded{{PLURAL_CLASS}}(null, {{PLURAL_LOWERCASE}}));
        }).catch((err) => {
            dispatch(Actions.loaded{{PLURAL_CLASS}}(err));
        });
    }
};


Actions.loaded{{PLURAL_CLASS}} = (error, payload) => {
    return { 
        type: Actions.LOADED_{{PLURAL_CONSTANT}}, 
        error,
        payload
    }
};


Actions.load{{SINGLE_CLASS}} = (slug) => {
    return (dispatch, getState) => {
        let state = getState();
        if (state.getIn(['{{PLURAL_LOWERCASE}}', 'is_loading_{{SINGLE_LOWERCASE}}'])) return;
        
        dispatch({ type: Actions.LOADING_{{SINGLE_CONSTANT}} });
        
        return API.get(`/app/{{PLURAL_LOWERCASE_DASHED}}/${slug}`).then(({{SINGLE_LOWERCASE}}) => {
            {{SINGLE_LOWERCASE}} = Immutable.fromJS({{SINGLE_LOWERCASE}});
            dispatch(Actions.loaded{{SINGLE_CLASS}}(null, {{SINGLE_LOWERCASE}}));
        }).catch((err) => {
            dispatch(Actions.loaded{{SINGLE_CLASS}}(err));
        });
    }
};


Actions.loaded{{SINGLE_CLASS}} = (error, payload) => {
    return {
        type: Actions.LOADED_{{SINGLE_CONSTANT}},
        error,
        payload
    }
};


Actions.create{{SINGLE_CLASS}} = (payload) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.CREATING_{{SINGLE_CONSTANT}} });
        
        return API.post('/app/{{PLURAL_LOWERCASE_DASHED}}', payload).then(({{SINGLE_LOWERCASE}}) => {
            {{SINGLE_LOWERCASE}} = Immutable.fromJS({{SINGLE_LOWERCASE}});
            dispatch(Actions.created{{SINGLE_CLASS}}(null, {{SINGLE_LOWERCASE}}));
        }).catch((err) => {
            dispatch(Actions.created{{SINGLE_CLASS}}(err));
        });
    }
};


Actions.created{{SINGLE_CLASS}} = (error, payload) => {
    return {
        type: Actions.CREATED_{{SINGLE_CONSTANT}},
        error,
        payload
    }
};


Actions.update{{SINGLE_CLASS}} = (slug, payload) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.UPDATING_{{SINGLE_CONSTANT}} });
        
        return API.put(`/app/{{PLURAL_LOWERCASE_DASHED}}/${slug}`, payload).then(({{SINGLE_LOWERCASE}}) => {
            {{SINGLE_LOWERCASE}} = Immutable.fromJS({{SINGLE_LOWERCASE}});
            dispatch(Actions.updated{{SINGLE_CLASS}}(null, {{SINGLE_LOWERCASE}}));
        }).catch((err) => {
            dispatch(Actions.updated{{SINGLE_CLASS}}(err));
        });
    }
};


Actions.updated{{SINGLE_CLASS}} = (error, payload) => {
    return {
        type: Actions.UPDATED_{{SINGLE_CONSTANT}},
        error,
        payload
    }
};


Actions.delete{{SINGLE_CLASS}} = (slug) => {
    return (dispatch, getState) => {
        dispatch({ type: Actions.DELETING_{{SINGLE_CONSTANT}} });
        
        return API.delete(`/app/{{PLURAL_LOWERCASE_DASHED}}/${slug}`).then(({{SINGLE_LOWERCASE}}) => {
            {{SINGLE_LOWERCASE}} = Immutable.fromJS({{SINGLE_LOWERCASE}});
            dispatch(Actions.deleted{{SINGLE_CLASS}}(null, {{SINGLE_LOWERCASE}}));
        }).catch((err) => {
            dispatch(Actions.deleted{{SINGLE_CLASS}}(err));
        });
    }
};


Actions.deleted{{SINGLE_CLASS}} = (error, payload) => {
    return {
        type: Actions.DELETED_{{SINGLE_CONSTANT}},
        error,
        payload
    }
};


module.exports = Actions;

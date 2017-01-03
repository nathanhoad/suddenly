const Redux = require('redux');
const ReduxImmutable = require('redux-immutable');
const Validator = require('validator');


const Prerequisites = {
    use (...methods) {
        return methods.map((method) => {
            return { method: Prerequisites[method], assign: method };
        });
    },
    
    
    initialState (request, reply) {
    }
}


module.exports = Prerequisites;

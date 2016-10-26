const ReduxImmutable = require('redux-immutable');

const routing = require('./routing-reducer');
const session = require('./session-reducer');


module.exports = ReduxImmutable.combineReducers({
    routing,
    session
});
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import tankDemoReducer from '../reducers/tankDemoReducer';
import subscriptionReducer from '../reducers/subscriptionReducer';

const store = createStore(
    combineReducers({ tankDemo: tankDemoReducer, subscription: subscriptionReducer }),
    //applyMiddleware( thunk)
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import tankDemoReducer from '../reducers/tankDemoReducer';

const store = createStore(
    combineReducers({ tankDemo: tankDemoReducer }),
    //applyMiddleware( thunk)
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import Thunk from 'redux-thunk'
import { data } from './storeReducer'

const storeEnhancer = applyMiddleware(Thunk);

const store = createStore(data, {}, storeEnhancer);

export { store, Provider }
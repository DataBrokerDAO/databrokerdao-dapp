import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { reducer as auth } from './authentication/reducer';
import StreamsReducer from './streams/reducer';
import PurchasesReducer from './purchases/reducer';
import WalletReducer from './wallet/reducer';
import ListingsReducer from './listings/reducer';
import DatasetsReducer from './datasets/reducer';
import TransactionsReducer from './transactions/reducer';
import ErrorReducer from './errors/reducer';
import UserReducer from './user/reducer';
import BridgeReducer from './bridge/reducer';

/**
 * This is the global reducer to which all reducers which are loaded at runtime are added.
 */

const rootReducer = (asyncReducers, initialState) => {
  let missingReducers = {};
  if (initialState !== undefined && typeof initialState === 'object') {
    for (let key in initialState) {
      if (!asyncReducers.hasOwnProperty(key)) {
        missingReducers[key] = () => initialState[key];
      }
    }
  }

  return combineReducers({
    routing: routerReducer,
    auth,
    streams: StreamsReducer,
    purchases: PurchasesReducer,
    wallet: WalletReducer,
    listings: ListingsReducer,
    datasets: DatasetsReducer,
    transactions: TransactionsReducer,
    error: ErrorReducer,
    user: UserReducer,
    bridge: BridgeReducer,
    ...asyncReducers,
    ...missingReducers
  });
};

/**
 * Modules export an injector so that keys cannot get mixed up.
 */
export function makeReducerInjector(key, reducer) {
  return store => {
    store.asyncReducers[key] = reducer;
    store.replaceReducer(rootReducer(store.asyncReducers));
  };
}

export default rootReducer;

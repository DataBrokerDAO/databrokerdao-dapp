import clone from 'lodash/clone';
import Immutable from 'seamless-immutable';

import { TRANSACTIONS_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  fetchingTransactions: false,
  total: 0,
  filter: {
    type: '',
    startDate: new Date(clone(new Date()).setMonth(new Date().getMonth() - 1)),
    endDate: new Date(clone(new Date()).setHours(23, 59, 59, 999)),
    start: 0,
    limit: 10,
    sort: 'desc'
  },
  transactionTypes: [],
  transactions: []
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case TRANSACTIONS_TYPES.FETCHING_TRANSACTIONS: {
      return Immutable.set(state, 'fetchingTransactions', action.value);
    }
    case TRANSACTIONS_TYPES.FETCH_TRANSACTIONS: {
      return Immutable.merge(state, {
        transactions: action.payload.events,
        total: action.payload.total,
        fetchingTransactions: false
      });
    }
    case TRANSACTIONS_TYPES.FETCH_TRANSACTION_TYPES: {
      return Immutable.merge(state, {
        transactionTypes: action.payload
      });
    }
    default:
      return state;
  }
}

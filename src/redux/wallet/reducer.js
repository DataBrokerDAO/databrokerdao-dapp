import Immutable from 'seamless-immutable';

import { WALLET_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  wallet: {},
  fetchingWallet: false,
  minting: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case WALLET_TYPES.CLEAR_ERRORS: {
      return Immutable.merge(state, {
        transactionError: null,
        transactionIndex: 1
      });
    }

    // TRANSACTION
    case WALLET_TYPES.TRANSACTION_INDEX: {
      return Immutable.set(state, 'transactionIndex', action.index);
    }
    case WALLET_TYPES.TRANSACTION_ERROR: {
      return Immutable.merge(state, {
        minting: false,
        transactionError: action.value
      });
    }
    case WALLET_TYPES.FETCH_WALLET: {
      return Immutable.merge(state, {
        wallet: action.wallet,
        fetchingWallet: false
      });
    }
    case WALLET_TYPES.FETCHING_WALLET: {
      return Immutable.set(state, 'fetchingWallet', action.value);
    }
    case WALLET_TYPES.MINTING_TOKENS: {
      return Immutable.set(state, 'minting', action.value);
    }
    default:
      return state;
  }
}

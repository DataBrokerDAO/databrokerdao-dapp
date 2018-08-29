import Immutable from 'seamless-immutable';

import { WALLET_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  wallet: {},
  fetchingWallet: false,
  mintingTokens: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
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
      return Immutable.set(state, 'mintingTokens', action.value);
    }
    default:
      return state;
  }
}

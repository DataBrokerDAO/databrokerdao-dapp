import Immutable from 'seamless-immutable';

import { WALLET_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  wallet: {},
  fetchingWallet: false,
  fetchingWalletError: null,

  connected: false,

  senderBalance: null,
  fetchingSenderBalance: false,
  fetchingSenderBalanceError: null,

  depositAmount: null,
  depositRecipient: null,
  depositing: false,
  depositingError: null,

  transactionIndex: 1,
  transactionError: null
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case WALLET_TYPES.CLEAR_ERRORS: {
      return Immutable.merge(state, {
        transactionError: null,
        transactionIndex: 1
      });
    }

    // BRIDGE
    case WALLET_TYPES.PROVIDER_CONNECTED: {
      return Immutable.merge(state, {
        connected: true
      });
    }
    case WALLET_TYPES.FETCHING_SENDER_BALANCE: {
      return Immutable.merge(state, {
        fetchingSenderBalance: action.value,
        senderBalance: action.senderBalance || null
      });
    }
    case WALLET_TYPES.FETCHING_SENDER_BALANCE_ERROR: {
      return Immutable.merge(state, {
        fetchingSenderBalanceError: action.error,
        fetchingSenderBalance: false,
        senderBalance: null
      });
    }

    case WALLET_TYPES.DEPOSITING_TOKENS: {
      return Immutable.merge(state, {
        depositing: action.value,
        depositAmount: action.amount || null,
        depositRecipient: action.depositRecipient || null
      });
    }
    case WALLET_TYPES.DEPOSITING_TOKENS_ERROR: {
      return Immutable.merge(state, {
        depositingError: action.error,
        depositing: false,
        depositAmount: null,
        depositRecipient: null
      });
    }

    // TRANSACTION
    case WALLET_TYPES.TRANSACTION_INDEX: {
      return Immutable.set(state, 'transactionIndex', action.index);
    }
    case WALLET_TYPES.TRANSACTION_ERROR: {
      return Immutable.merge(state, {
        depositing: false,
        transactionError: action.error
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
    case WALLET_TYPES.FETCHING_WALLET_ERROR: {
      return Immutable.merge(state, {
        fetchingWallet: false,
        fetchingWalletError: action.error
      });
    }
    case WALLET_TYPES.MINTING_TOKENS: {
      return Immutable.set(state, 'minting', action.value);
    }
    default:
      return state;
  }
}

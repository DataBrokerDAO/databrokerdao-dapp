import Immutable from 'seamless-immutable';
import { PURCHASES_TYPES } from './actions.js';
import { AUTH_TYPES } from '../authentication/actions.js';

export const DEFAULT_STATE = {
  purchasing: false,
  fetchingPurchase: false,
  fetchingPurchaseError: null,
  purchase: null,
  transactionIndex: 1,
  transactionError: null,
  deliveryExplainerDialogVisible: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case PURCHASES_TYPES.TOGGLE_DELIVERY_EXPLAINER: {
      return Immutable.set(
        state,
        'deliveryExplainerDialogVisible',
        !state.deliveryExplainerDialogVisible
      );
    }

    case PURCHASES_TYPES.CLEAR_ERRORS: {
      return Immutable.merge(state, {
        fetchingPurchaseError: null,
        transactionIndex: 1,
        transactionError: null
      });
    }

    // TRANSACTION
    case PURCHASES_TYPES.TRANSACTION_INDEX: {
      return Immutable.set(state, 'transactionIndex', action.index);
    }
    case PURCHASES_TYPES.TRANSACTION_ERROR: {
      return Immutable.merge(state, {
        fetchingPurchase: false,
        transactionError: action.value
      });
    }

    // PURCHASING SENSOR
    case PURCHASES_TYPES.PURCHASING_ACCESS: {
      return Immutable.merge(state, {
        purchasing: action.value
      });
    }
    case PURCHASES_TYPES.PURCHASING_ACCESS_ERROR: {
      return Immutable.merge(state, {
        purchasing: false,
        error: action.error
      });
    }
    case PURCHASES_TYPES.FETCHING_PURCHASE: {
      return Immutable.merge(state, {
        fetchingPurchase: action.value,
        purchase: action.purchase || null
      });
    }
    case PURCHASES_TYPES.FETCHING_PURCHASE_ERROR: {
      return Immutable.merge(state, {
        fetchingPurchaseError: action.error,
        fetchingPurchase: false,
        purchase: null
      });
    }
    case AUTH_TYPES.TOKEN_RECEIVED: {
      return Immutable.merge(state, {
        fetchingSensorError: null,
        fetchingStreamsError: null,
        fetchingDatasetsError: null,
        transactionError: null
      });
    }
    default:
      return state;
  }
}

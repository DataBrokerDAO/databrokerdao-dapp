import Immutable from 'seamless-immutable';
import { PURCHASES_TYPES } from './actions.js';
import { AUTH_TYPES } from '../authentication/actions.js';

export const DEFAULT_STATE = {
  purchasingAccess: false,

  fetchingPurchase: false,
  fetchingPurchaseError: null,
  purchase: null
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case PURCHASES_TYPES.PURCHASING_ACCESS: {
      return Immutable.merge(state, {
        purchasingAccess: action.value
      });
    }
    case PURCHASES_TYPES.PURCHASING_ACCESS_ERROR: {
      return Immutable.merge(state, {
        purchasingAccess: false,
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
        fetchingDatasetsError: null
      });
    }
    default:
      return state;
  }
}

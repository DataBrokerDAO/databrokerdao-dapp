import Immutable from 'seamless-immutable';
import { LISTING_TYPES } from './actions.js';
import { AUTH_TYPES } from '../authentication/actions.js';

export const DEFAULT_STATE = {
  enlistingStream: false,
  enlistingStreamError: null,
  enlistingDataset: false,
  enlistingDatasetError: null,
  transactionIndex: 1,
  transactionError: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case LISTING_TYPES.CLEAR_ERRORS: {
      return Immutable.merge(state, {
        enlistingStreamError: null,
        enlistingDatasetError: null,
        transactionError: null,
        transactionIndex: 1
      });
    }

    // TRANSACTION
    case LISTING_TYPES.TRANSACTION_INDEX: {
      return Immutable.set(state, 'transactionIndex', action.index);
    }
    case LISTING_TYPES.TRANSACTION_ERROR: {
      return Immutable.merge(state, {
        enlistingStream: false,
        transactionError: action.value
      });
    }

    // ENLISTING STREAM
    case LISTING_TYPES.ENLISTING_STREAM: {
      return Immutable.merge(state, { enlistingStream: action.value });
    }
    case LISTING_TYPES.ENLISTING_STREAM_ERROR: {
      return Immutable.merge(state, {
        enlistingStream: false,
        enlistingStreamError: action.value
      });
    }

    // ENLISTING DATASET
    case LISTING_TYPES.ENLISTING_DATASET: {
      return Immutable.merge(state, { enlistingDataset: action.value });
    }
    case LISTING_TYPES.ENLISTING_DATASET_ERROR: {
      return Immutable.merge(state, {
        enlistingDataset: false,
        enlistingDatasetError: action.value
      });
    }

    // CLEAR ERRORS AFTER LOGIN
    case AUTH_TYPES.TOKEN_RECEIVED: {
      return Immutable.merge(state, {
        transactionError: null,
        enlistingStreamError: null,
        enlistingDatasetError: null
      });
    }
    default:
      return state;
  }
}

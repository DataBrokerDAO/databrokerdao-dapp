import Immutable from 'seamless-immutable';

import { ERROR_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  googleMapError: {}
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case ERROR_TYPES.GOOGLE_MAP_ERROR: {
      return Immutable.set(state, 'googleMapError', action.error);
    }
    case ERROR_TYPES.LOCATION_ERROR: {
      return Immutable.set(state, 'locationError', action.error);
    }
    case ERROR_TYPES.AUTHENTICATION_ERROR: {
      // Picked up by other reducers
      return state;
    }
    default:
      return state;
  }
}

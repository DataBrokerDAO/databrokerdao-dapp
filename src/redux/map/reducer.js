import Immutable from 'seamless-immutable';

import { MAP_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  googleApiLoaded: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case MAP_TYPES.GOOGLE_API_LOADED: {
      return Immutable.set(state, 'googleApiLoaded', true);
    }
    default:
      return state;
  }
}

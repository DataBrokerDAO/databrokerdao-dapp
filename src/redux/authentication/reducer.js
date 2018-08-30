import localStorage from '../../localstorage';
import { AUTH_TYPES } from './actions';
import Immutable from 'seamless-immutable';

export const DEFAULT_STATE = {
  token: localStorage.getItem('jwtToken') || false,
  roles: localStorage.getItem('roles') || [],
  address: localStorage.getItem('address') || null
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case AUTH_TYPES.TOKEN_RECEIVED: {
      return Immutable.merge(state, {
        token: action.payload.token,
        address: action.payload.address
      });
    }
    case AUTH_TYPES.ROLES_RECEIVED: {
      return Immutable.merge(state, {
        roles: action.payload.roles
      });
    }
    case AUTH_TYPES.LOGOUT: {
      return Immutable.merge(state, {
        token: null
      });
    }
    default:
      return state;
  }
}

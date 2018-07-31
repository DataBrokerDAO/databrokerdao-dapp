import Wallet from 'ethereumjs-wallet';
import axios from '../../utils/axios';
import ECIES from './ecies';
import Notifications from 'react-notification-system-redux';
import localStorage from '../../localstorage';

// ------------------------------------
// Constants
// ------------------------------------

export const TOKEN_RECEIVED = 'TOKEN_RECEIVED';
export const ROLES_RECEIVED = 'ROLES_RECEIVED';
export const LOGOUT = 'LOGOUT';

// ------------------------------------
// Actions
// ------------------------------------
export function register(values, { props, setErrors }) {
  //setSubmitting
  return async (dispatch, getState) => {
    const axiosClient = axios();
    try {
      const retrieveResponse = await axiosClient.post(
        '/accounts/authenticate',
        {
          username: encodeURIComponent(values.email),
          password: encodeURIComponent(values.password)
        }
      );
      const { token, ethereum } = retrieveResponse.data;
      localStorage.setItem('address', ethereum.address);
      localStorage.setItem('email', values.email);

      dispatch({
        type: TOKEN_RECEIVED,
        payload: { token, address: ethereum.address }
      });

      // GET THE ROLES OF THE USER
      const authenticatedAxiosClient = axios(token);
      const roleResponse = await authenticatedAxiosClient.get(
        `/wallet/roles?address=${encodeURIComponent(ethereum.address)}`
      );
      localStorage.setItem('roles', roleResponse.data.roles);
      dispatch({
        type: ROLES_RECEIVED,
        payload: { roles: roleResponse.data.roles }
      });

      if (props.callBack) props.callBack();
    } catch (error) {
      setErrors({
        email:
          (error.response &&
            error.response.data &&
            error.response.data.userMessage) ||
          error.message
      });
    }
    //setSubmitting(false);
  };
}

export function login(values, { props, setSubmitting, setErrors }) {
  return async (dispatch, getState) => {
    const axiosClient = axios();
    try {
      const retrieveResponse = await axiosClient.post(
        '/accounts/authenticate',
        {
          username: encodeURIComponent(values.email),
          password: encodeURIComponent(values.password)
        }
      );
      const { token, ethereum } = retrieveResponse.data;
      localStorage.setItem('address', ethereum.address);
      localStorage.setItem('email', values.email);

      dispatch({
        type: TOKEN_RECEIVED,
        payload: { token, address: ethereum.address }
      });

      // GET THE ROLES OF THE USER
      const authenticatedAxiosClient = axios(token);
      const roleResponse = await authenticatedAxiosClient.get(
        `/wallet/roles?address=${encodeURIComponent(ethereum.address)}`
      );
      localStorage.setItem('roles', roleResponse.data.roles);
      dispatch({
        type: ROLES_RECEIVED,
        payload: { roles: roleResponse.data.roles }
      });
    } catch (error) {
      setErrors({
        email:
          (error.response &&
            error.response.data &&
            error.response.data.userMessage) ||
          error.message
      });
    }
    setSubmitting(false);
  };
}

export function logout() {
  return async (dispatch, getState) => {
    try {
      // Remove all data from localStorage.
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('roles');
      localStorage.removeItem('address');
      localStorage.removeItem('email');

      // Remove all data from redux.
      dispatch({
        type: LOGOUT,
        payload: {}
      });
    } catch (e) {
      dispatch(
        Notifications.error({
          title: 'Something went wrong',
          message:
            'Could not log out. Contact support if this keeps happening.',
          position: 'tr',
          autoDismiss: 0
        })
      );
      console.error(e);
    }
  };
}

// ------------------------------------
// Action Handlers
// ------------------------------------

// Dispatching an action within a reducer is an anti-pattern.
// Your reducer should be without side effects, simply digesting the action payload and returning a new state object.

const ACTION_HANDLERS = {
  [TOKEN_RECEIVED]: (state, action) => {
    return {
      ...state,
      token: action.payload.token,
      address: action.payload.address
    };
  },
  [ROLES_RECEIVED]: (state, action) => {
    return {
      ...state,
      roles: action.payload.roles
    };
  },
  [LOGOUT]: (state, action) => {
    return {};
  }
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  token: localStorage.getItem('jwtToken') || false,
  roles: localStorage.getItem('roles') || [],
  address: localStorage.getItem('address') || null
};

function reducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

export { initialState, reducer };

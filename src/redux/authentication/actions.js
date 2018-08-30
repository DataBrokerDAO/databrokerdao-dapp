import axios from '../../utils/axios';
import Notifications from 'react-notification-system-redux';

export const AUTH_TYPES = {
  TOKEN_RECEIVED: 'TOKEN_RECEIVED',
  ROLES_RECEIVED: 'ROLES_RECEIVED',
  LOGOUT: 'LOGOUT'
};

export const AUTH_ACTIONS = {
  register: (values, { props, setErrors }) => {
    return async (dispatch, getState) => {
      const axiosClient = axios();
      try {
        const retrieveResponse = await axiosClient.post('/accounts', {
          username: encodeURIComponent(values.email),
          password: encodeURIComponent(values.password)
        });

        const { token, ethereum } = retrieveResponse.data;
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('address', ethereum.address);
        localStorage.setItem('email', values.email);

        dispatch({
          type: AUTH_TYPES.TOKEN_RECEIVED,
          payload: { token, address: ethereum.address }
        });

        const authenticatedAxiosClient = axios(token);
        const roleResponse = await authenticatedAxiosClient.get(
          `/wallet/roles?address=${encodeURIComponent(ethereum.address)}`
        );
        localStorage.setItem('roles', roleResponse.data.roles);
        dispatch({
          type: AUTH_TYPES.ROLES_RECEIVED,
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
    };
  },

  login: (values, { props, setSubmitting, setErrors }) => {
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
        localStorage.setItem('jwtToken', token);

        dispatch({
          type: AUTH_TYPES.TOKEN_RECEIVED,
          payload: { token, address: ethereum.address }
        });

        // GET THE ROLES OF THE USER
        const authenticatedAxiosClient = axios(token);
        const roleResponse = await authenticatedAxiosClient.get(
          `/wallet/roles?address=${encodeURIComponent(ethereum.address)}`
        );
        localStorage.setItem('roles', roleResponse.data.roles);
        dispatch({
          type: AUTH_TYPES.ROLES_RECEIVED,
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
  },

  logout: () => {
    return async (dispatch, getState) => {
      try {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('roles');
        localStorage.removeItem('address');
        localStorage.removeItem('email');

        dispatch({
          type: AUTH_TYPES.LOGOUT,
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
};

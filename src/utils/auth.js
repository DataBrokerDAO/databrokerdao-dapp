import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper';
import jwtDecode from 'jwt-decode';
import { convertDateToTimestamp } from './transforms';
import localStorage from '../localstorage';

const locationHelper = locationHelperBuilder({});

function validateToken(state) {
  let valid = false;

  if (state.auth.token) {
    try {
      const decoded = jwtDecode(state.auth.token);
      const now = convertDateToTimestamp(new Date());
      valid = decoded.exp > now;
    } catch (e) {
      // Do nothing
    }
  }

  if (!valid) {
    localStorage.removeItem('jwtToken');
  }

  return valid;
}

const userIsAuthenticatedDefaults = {
  authenticatedSelector: state => validateToken(state),
  wrapperDisplayName: 'UserIsAuthenticated'
};

export const userIsAuthenticated = connectedAuthWrapper(
  userIsAuthenticatedDefaults
);

export const userIsAuthenticatedRedir = connectedRouterRedirect({
  ...userIsAuthenticatedDefaults,
  redirectPath: '/'
});

const userIsNotAuthenticatedDefaults = {
  authenticatedSelector: state => !validateToken(state),
  wrapperDisplayName: 'UserIsNotAuthenticated'
};

export const userIsNotAuthenticated = connectedAuthWrapper(
  userIsNotAuthenticatedDefaults
);

export const userIsNotAuthenticatedRedir = connectedRouterRedirect({
  ...userIsNotAuthenticatedDefaults,
  redirectPath: (state, ownProps) =>
    locationHelper.getRedirectQueryParam(ownProps) || '/',
  allowRedirectBack: false
});

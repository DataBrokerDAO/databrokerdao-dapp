import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper';
import jwtDecode from 'jwt-decode';
import { convertDateToTimestamp } from './transforms';

const locationHelper = locationHelperBuilder({});

function validateToken(state) {
  const token = state.auth.token;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const now = convertDateToTimestamp(new Date());
      if (decoded.exp < now) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
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

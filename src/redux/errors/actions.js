export const ERROR_TYPES = {
  GOOGLE_MAP_ERROR: 'GOOGLE_MAP_ERROR',
  LOCATION_ERROR: 'LOCATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR'
};

export const ERROR_ACTIONS = {
  setMapError: error => dispatch =>
    dispatch({
      type: ERROR_TYPES.GOOGLE_MAP_ERROR,
      error
    }),
  setLocationError: error => dispatch =>
    dispatch({
      type: ERROR_TYPES.LOCATION_ERROR,
      error
    }),
  setAuthenticationError: error => dispatch =>
    dispatch({
      type: ERROR_TYPES.AUTHENTICATION_ERROR,
      error
    })
};

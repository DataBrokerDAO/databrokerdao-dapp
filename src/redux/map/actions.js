export const MAP_TYPES = {
  GOOGLE_API_LOADED: 'GOOGLE_API_LOADED'
};

export const MAP_ACTIONS = {
  setGoogleApiLoaded: () => dispatch =>
    dispatch({
      type: MAP_TYPES.GOOGLE_API_LOADED
    })
};

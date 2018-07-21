import { ERROR_TYPES } from "../errors/actions";
import { STREAMS_ACTIONS } from "../streams/actions"

export const USER_TYPES = {
  SET_LOCATION: "SET_LOCATION"
};

export const USER_ACTIONS = {
  updateLocation: () => dispatch => {
    if (navigator === "undefined") {
      dispatch({
        type: ERROR_TYPES.LOCATION_ERROR,
        error: "geolocation is not supported"
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords: location }) => {
            const { latitude: lat, longitude: lng } = location;

            dispatch(STREAMS_ACTIONS.setCenter({ lat, lng }));
            dispatch({
                type: USER_TYPES.SET_LOCATION,
                location
            })
        },
        ({ message: error }) =>
          dispatch({
            type: ERROR_TYPES.LOCATION_ERROR,
            error
          })
      );
    }
  }
};

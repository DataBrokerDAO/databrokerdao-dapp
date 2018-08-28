import Immutable from 'seamless-immutable';

import { STREAMS_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  filter: {
    location: null,
    types: ['temperature', 'humidity', 'PM25', 'PM10'] //Types in current filter
  },
  map: {
    distance: 0,
    fetchLat: 50.879844, //Lat at which we last fetched streams
    fetchLng: 4.700518, //Lng at which we last fetched streams
    lat: 50.879844,
    lng: 4.700518,
    zoom: 10
  },
  streams: {},
  landingStreams: {},
  fetchingStreams: false,
  availableStreamTypes: [], //All possible types the user could filter on
  fetchStreamCounter: 0,
  challengingStream: false,
  nearbyStreams: [],
  fetchingNearbyStreams: false,
  challenges: [],
  fetchingChallenges: false,
  formattedAddress: null,
  error: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case STREAMS_TYPES.FETCHING_STREAMS: {
      return Immutable.set(state, 'fetchingStreams', action.value);
    }
    case STREAMS_TYPES.FETCH_STREAMS: {
      return Immutable.merge(state, {
        streams: action.streams,
        fetchingStreams: false,
        error: false
      });
    }
    case STREAMS_TYPES.FETCH_LANDING_STREAMS: {
      return Immutable.merge(state, { landingStreams: action.streams });
    }
    case STREAMS_TYPES.FETCH_STREAM: {
      const newStreams = Immutable.asMutable(state, { deep: true }).streams;
      newStreams[action.stream.key] = action.stream;
      return Immutable.merge(state, { streams: newStreams });
    }
    case STREAMS_TYPES.FETCH_AVAILABLE_STREAM_TYPES: {
      return Immutable.merge(state, {
        availableStreamTypes: action.availableStreamTypes
      });
    }
    case STREAMS_TYPES.UPDATED_FILTER: {
      return Immutable.merge(state, { filter: action.filter });
    }
    case STREAMS_TYPES.UPDATED_MAP: {
      return Immutable.merge(state, { map: action.map });
    }
    case STREAMS_TYPES.FETCH_STREAM_COUNTER: {
      return Immutable.set(state, 'fetchStreamCounter', action.value);
    }
    case STREAMS_TYPES.CHALLENGING_STREAM: {
      return Immutable.set(state, 'challengingStream', action.value);
    }
    case STREAMS_TYPES.FETCH_NEARBY_STREAMS: {
      return Immutable.merge(state, {
        nearbyStreams: action.streams,
        fetchingNearbyStreams: false
      });
    }
    case STREAMS_TYPES.FETCHING_NEARBY_STREAMS: {
      return Immutable.set(state, 'fetchingNearbyStreams', action.value);
    }
    case STREAMS_TYPES.FETCH_CHALLENGES: {
      return Immutable.merge(state, {
        challenges: action.challenges,
        fetchingNearbyStreams: false
      });
    }
    case STREAMS_TYPES.FETCHING_CHALLENGES: {
      return Immutable.set(state, 'fetchingChallenges', action.value);
    }
    case STREAMS_TYPES.FETCH_FORMATTED_ADDRESS: {
      return Immutable.set(state, 'formattedAddress', action.formattedAddress);
    }
    case STREAMS_TYPES.FETCH_FILTER_ADDRESS: {
      return Immutable.set(state, 'filterAddress', action.filterAddress);
    }
    case STREAMS_TYPES.FETCH_ERROR: {
      return Immutable.merge(state, {
        error: true,
        fetchingStreams: false
      });
    }
    default:
      return state;
  }
}

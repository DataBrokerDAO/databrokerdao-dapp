import Immutable from 'seamless-immutable';
import { SENSORS_TYPES } from './actions.js';
import { AUTH_TYPES } from '../authentication/actions.js';

export const DEFAULT_STATE = {
  fetchingDatasets: false,
  fetchingDatasetsError: null,
  datasets: [],
  datasetsRows: 10,

  fetchingStreams: false,
  fetchingStreamsError: null,
  streams: [],
  streamsRows: 10,

  fetchingSensor: false,
  fetchingSensorError: null,
  sensor: null,

  deliveryExplainerVisible: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case SENSORS_TYPES.FETCHING_DATASETS: {
      return Immutable.merge(state, {
        fetchingDatasets: action.value,
        fetchingDatasetsError: action.value
          ? state.fetchingDatasetsError
          : null,
        datasets: action.datasets || [],
        datasetsRows: action.rows || 0
      });
    }
    case SENSORS_TYPES.FETCHING_DATASETS_ERROR: {
      return Immutable.merge(state, {
        fetchingDatasets: false,
        fetchingDatasetsError: action.error,
        datasets: [],
        datasetsRows: 0
      });
    }
    case SENSORS_TYPES.UPDATE_DATASETS_PAGE: {
      return Immutable.merge(state, {
        datasetsPage: action.page,
        datasetsRowsPerPage: action.rowsPerpage
      });
    }
    case SENSORS_TYPES.FETCHING_STREAMS: {
      return Immutable.merge(state, {
        fetchingStreams: action.value,
        fetchingStreamsError: action.value ? state.fetchingStreamsError : null,
        streams: action.streams || [],
        streamsRows: action.rows || 0
      });
    }
    case SENSORS_TYPES.FETCHING_STREAMS_ERROR: {
      return Immutable.merge(state, {
        fetchingStreams: false,
        fetchingStreamsError: action.error,
        streams: [],
        streamsRows: 0
      });
    }
    case SENSORS_TYPES.UPDATE_STREAMS_PAGE: {
      return Immutable.merge(state, {
        streamsPage: action.page,
        streamsRowsPerPage: action.rowsPerpage
      });
    }
    case SENSORS_TYPES.FETCHING_SENSOR: {
      return Immutable.merge(state, {
        fetchingSensor: action.value,
        fetchingSensorError: action.value ? state.fetchingSensorError : null,
        sensor: action.sensor || null
      });
    }
    case SENSORS_TYPES.FETCHING_SENSOR_ERROR: {
      return Immutable.merge(state, {
        fetchingSensor: false,
        fetchingSensorError: action.error,
        sensor: null
      });
    }
    case AUTH_TYPES.TOKEN_RECEIVED: {
      return Immutable.merge(state, {
        fetchingSensorError: null,
        fetchingStreamsError: null,
        fetchingDatasetsError: null
      });
    }
    default:
      return state;
  }
}

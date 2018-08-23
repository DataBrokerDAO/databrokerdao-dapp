import Immutable from 'seamless-immutable';
import { PURCHASES_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  streams: [],
  fetchingStreams: false,
  rowsStreams: 10,
  totalStreams: 0,
  pageStreams: 1,
  datasets: [],
  fetchingDatasets: false,
  rowsDatasets: 10,
  totalDatasets: 0,
  pageDatasets: 1,
  purchasingAccess: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case PURCHASES_TYPES.FETCHING_STREAMS: {
      return Immutable.set(state, 'fetchingStreams', action.value);
    }
    case PURCHASES_TYPES.FETCHED_STREAMS: {
      return Immutable.merge(state, {
        streams: action.streams,
        totalStreams: action.total,
        fetchingStreams: false
      });
    }
    case PURCHASES_TYPES.FETCHING_DATASETS: {
      return Immutable.set(state, 'fetchingDatasets', action.value);
    }
    case PURCHASES_TYPES.FETCHED_DATASETS: {
      return Immutable.merge(state, {
        datasets: action.datasets,
        totalDatasets: action.total,
        fetchingDatasets: false
      });
    }
    case PURCHASES_TYPES.UPDATE_CURRENT_PAGE_DATASETS: {
      return Immutable.merge(state, {
        pageDatasets: action.page
      });
    }
    case PURCHASES_TYPES.UPDATE_ROWS_PER_PAGE_DATASETS: {
      return Immutable.merge(state, {
        rowsDatasets: action.rows
      });
    }
    case PURCHASES_TYPES.UPDATE_CURRENT_PAGE_STREAMS: {
      return Immutable.merge(state, {
        pageStreams: action.page
      });
    }
    case PURCHASES_TYPES.UPDATE_ROWS_PER_PAGE_STREAMS: {
      return Immutable.merge(state, {
        rowsStreams: action.rows
      });
    }
    case PURCHASES_TYPES.PURCHASING_ACCESS: {
      return Immutable.set(state, 'purchasingAccess', action.value);
    }
    default:
      return state;
  }
}

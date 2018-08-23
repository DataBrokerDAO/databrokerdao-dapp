import Immutable from 'seamless-immutable';
import { LISTING_TYPES } from './actions.js';

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

  enlistingStream: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case LISTING_TYPES.FETCHING_STREAM_LISTINGS: {
      return Immutable.set(state, 'fetchingStreamListings', action.value);
    }
    case LISTING_TYPES.FETCHED_STREAM_LISTINGS: {
      return Immutable.merge(state, {
        streams: action.streams,
        totalStreams: action.total,
        fetchingStreamListings: false
      });
    }
    case LISTING_TYPES.ENLISTING_STREAM: {
      return Immutable.set(state, 'enlistingStream', action.value);
    }
    case LISTING_TYPES.FETCHING_DATASET_LISTINGS: {
      return Immutable.set(state, 'fetchingDatasetListings', action.value);
    }
    case LISTING_TYPES.FETCHED_DATASET_LISTINGS: {
      return Immutable.merge(state, {
        datasets: action.datasets,
        totalDatasets: action.total,
        fetchingDatasetListings: false
      });
    }
    case LISTING_TYPES.UPDATE_CURRENT_PAGE_DATASETS: {
      return Immutable.merge(state, {
        pageDatasets: action.page
      });
    }
    case LISTING_TYPES.UPDATE_ROWS_PER_PAGE_DATASETS: {
      return Immutable.merge(state, {
        rowsDatasets: action.rows
      });
    }
    case LISTING_TYPES.UPDATE_CURRENT_PAGE_STREAMS: {
      return Immutable.merge(state, {
        pageStreams: action.page
      });
    }
    case LISTING_TYPES.UPDATE_ROWS_PER_PAGE_STREAMS: {
      return Immutable.merge(state, {
        rowsStreams: action.rows
      });
    }
    default:
      return state;
  }
}

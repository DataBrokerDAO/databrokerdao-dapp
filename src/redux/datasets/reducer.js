import Immutable from 'seamless-immutable';

import { DATASET_TYPES } from './actions.js';

export const DEFAULT_STATE = {
  filter: {
    categories: ['agriculture', 'environment', 'health', 'energy'],
    filetypes: ['json', 'xls', 'csv'],
    start: 0,
    limit: 10,
    sort: 'asc'
  },
  datasets: {},
  fetchingDatasets: false,
  fetchingDatasetsError: null,
  fetchDatasetCounter: 0,

  availableCategories: [],
  availableFiletypes: [],

  challengingDataset: false,
  challenges: [],
  fetchingChallenges: false,
  fetchingChallengesError: null,

  rows: 10,
  total: 0,
  page: 1
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case DATASET_TYPES.FETCHING_DATASETS: {
      return Immutable.merge(state, {
        fetchingDatasets: action.value,
        datasets: action.datasets || {},
        total: action.total || 0
      });
    }
    case DATASET_TYPES.FETCHING_DATASETS_ERROR: {
      return Immutable.merge(state, {
        fetchingDatasetsError: action.error,
        fetchingDatasets: false,
        datasets: [],
        total: 0
      });
    }
    case DATASET_TYPES.FETCHING_DATASET: {
      return Immutable.merge(state, {
        fetchingDataset: action.value,
        dataset: action.dataset || null
      });
    }
    case DATASET_TYPES.FETCHING_DATASET_ERROR: {
      return Immutable.merge(state, {
        fetchingDatasetError: action.error,
        fetchingDataset: false,
        dataset: null
      });
    }
    case DATASET_TYPES.FETCH_AVAILABLE_FILETYPES: {
      return Immutable.merge(state, {
        availableFiletypes: action.availableFiletypes
      });
    }
    case DATASET_TYPES.FETCH_AVAILABLE_CATEGORIES: {
      return Immutable.merge(state, {
        availableCategories: action.availableCategories
      });
    }
    case DATASET_TYPES.DATASET_UPDATED_FILTER: {
      return Immutable.merge(state, { filter: action.filter });
    }
    case DATASET_TYPES.FETCH_DATASET_COUNTER: {
      return Immutable.set(state, 'fetchDatasetCounter', action.value);
    }
    case DATASET_TYPES.CHALLENGING_DATASET: {
      return Immutable.set(state, 'challengingDataset', action.value);
    }
    case DATASET_TYPES.UPDATE_CURRENT_PAGE: {
      return Immutable.merge(state, {
        page: action.page
      });
    }
    case DATASET_TYPES.UPDATE_ROWS_PER_PAGE: {
      return Immutable.merge(state, {
        rows: action.rows
      });
    }
    default:
      return state;
  }
}

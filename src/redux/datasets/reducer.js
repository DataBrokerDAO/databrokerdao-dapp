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
  availableCategories: [],
  availableFiletypes: [],
  fetchDatasetCounter: 0,
  challengingDataset: false,
  challenges: [],
  fetchingChallenges: false
};

export default function(state = Immutable(DEFAULT_STATE), action) {
  switch (action.type) {
    case DATASET_TYPES.FETCHING_DATASETS: {
      return Immutable.set(state, 'fetchingDatasets', action.value);
    }
    case DATASET_TYPES.FETCH_DATASETS: {
      return Immutable.merge(state, {
        datasets: action.datasets,
        fetchingDatasets: false
      });
    }
    case DATASET_TYPES.FETCH_DATASET: {
      const newDatasets = Immutable.asMutable(state, { deep: true }).datasets;
      newDatasets[action.dataset.key] = action.dataset;
      return Immutable.merge(state, { datasets: newDatasets });
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
    case DATASET_TYPES.FETCH_CHALLENGES: {
      return Immutable.merge(state, {
        challenges: action.challenges
      });
    }
    case DATASET_TYPES.FETCHING_CHALLENGES: {
      return Immutable.set(state, 'fetchingChallenges', action.value);
    }
    default:
      return state;
  }
}

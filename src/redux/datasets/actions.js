import map from 'lodash/map';
import axios from '../../utils/axios';
import {
  fetchSensors,
  fetchSensor,
  parseDatasets,
  parseDataset
} from '../../api/sensors';
import { fetchChallenges } from '../../api/challenges';

export const DATASET_TYPES = {
  FETCHING_DATASETS: 'FETCHING_DATASETS',
  FETCH_DATASETS: 'FETCH_DATASETS',
  FETCH_DATASET: 'FETCH_DATASET',
  CHALLENGING_DATASET: 'CHALLENGING_DATASET',
  FETCH_CHALLENGES: 'FETCH_CHALLENGES',
  FETCHING_CHALLENGES: 'FETCHING_CHALLENGES',
  DATASET_UPDATED_FILTER: 'DATASET_UPDATED_FILTER',
  FETCH_DATASET_COUNTER: 'FETCH_DATASET_COUNTER',
  FETCH_AVAILABLE_CATEGORIES: 'FETCH_AVAILABLE_CATEGORIES',
  FETCH_AVAILABLE_FILETYPES: 'FETCH_AVAILABLE_FILETYPES',
  UPDATE_CURRENT_PAGE: 'UPDATE_CURRENT_PAGE',
  UPDATE_ROWS_PER_PAGE: 'UPDATE_ROWS_PER_PAGE'
};

export const DATASET_ACTIONS = {
  fetchDatasets: _filter => {
    return (dispatch, getState) => {
      const state = getState();

      dispatch({
        type: DATASET_TYPES.FETCHING_DATASETS,
        value: true
      });

      const filter = _filter ? _filter : state.datasets.filter;

      // Start with filtering only the datasets
      let filterUrlQuery = 'item.sensortype=DATASET&';

      // Filter on category
      if (filter.categories && filter.categories.length === 0)
        filterUrlQuery += `item.category=none`;
      else if (filter.categories && filter.categories.length === 1)
        filterUrlQuery += `item.category=${filter.categories[0]}`;
      else
        filterUrlQuery += map(filter.categories, cat => {
          return `item.category[]=${cat}`;
        }).join('&');

      filterUrlQuery += '&';

      // Filter on filetype
      if (filter.filetypes && filter.filetypes.length === 0)
        filterUrlQuery += `item.filetype=none`;
      else if (filter.filetypes && filter.filetypes.length === 1)
        filterUrlQuery += `item.filetype=${filter.filetypes[0]}`;
      else
        filterUrlQuery += map(filter.filetypes, type => {
          return `item.filetype[]=${type}`;
        }).join('&');

      if (_filter) {
        dispatch({
          type: DATASET_TYPES.DATASET_UPDATED_FILTER,
          filter
        });
      }

      const { limit, start, sort } = filter;

      const authenticatedAxiosClient = axios(null, true);
      const fetchDatasetCounter = state.datasets.fetchDatasetCounter + 1;

      // Counter to keep track of calls so when response arrives we can take the latest
      (counter => {
        fetchSensors(
          authenticatedAxiosClient,
          {
            limit,
            start,
            sort,
            filterUrlQuery
          },
          true
        )
          .then(response => {
            if (counter !== getState().datasets.fetchDatasetCounter) {
              return;
            }

            const parsedResponse = parseDatasets(response.data.items);

            dispatch({
              type: DATASET_TYPES.FETCH_DATASETS,
              datasets: parsedResponse,
              total: response.data.total
            });
          })
          .catch(error => {
            dispatch({
              type: DATASET_TYPES.FETCH_DATASETS,
              datasets: [],
              total: 0
            });
            console.log(error);
          });
      })(fetchDatasetCounter);
      dispatch({
        type: DATASET_TYPES.FETCH_DATASET_COUNTER,
        value: fetchDatasetCounter
      });
    };
  },
  fetchDataset: (dispatch, dataset) => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.FETCHING_CHALLENGES,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);

      fetchSensor(authenticatedAxiosClient, dataset)
        .then(response => {
          let parsedResponse = response.data_id
            ? parseDataset(response.data)
            : {};

          dispatch({
            type: DATASET_TYPES.FETCH_DATASET,
            dataset: parsedResponse
          });

          // Get challenges
          const urlParametersChallenges = `listing=${dataset}`;
          fetchChallenges(
            authenticatedAxiosClient,
            urlParametersChallenges
          ).then(response => {
            const parsedResponse = [];
            dispatch({
              type: DATASET_TYPES.FETCH_CHALLENGES,
              challenges: parsedResponse
            });
          });
        })
        .catch(error => {
          console.log(error);
        });
    };
  },
  fetchAvailableFiletypes: () => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.FETCH_AVAILABLE_FILETYPES,
        availableFiletypes: {
          json: {
            name: 'json',
            id: 'json'
          },
          xls: {
            name: 'xls',
            id: 'xls'
          },
          csv: {
            name: 'csv',
            id: 'csv'
          }
        }
      });
    };
  },
  fetchAvailableCategories: () => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.FETCH_AVAILABLE_CATEGORIES,
        availableCategories: {
          agriculture: {
            name: 'Agriculture',
            id: 'agriculture'
          },
          environment: {
            name: 'Environment',
            id: 'environment'
          },
          health: {
            name: 'Health',
            id: 'health'
          },
          energy: {
            name: 'Energy',
            id: 'energy'
          }
        }
      });
    };
  },
  updateCurrentPage: currentPage => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.UPDATE_CURRENT_PAGE,
        page: currentPage
      });
    };
  },
  updateRowsPerPage: rowsPerPage => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.UPDATE_ROWS_PER_PAGE,
        rows: rowsPerPage
      });
    };
  }
};

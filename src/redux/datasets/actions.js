import map from 'lodash/map';
import axios from '../../utils/axios';
import {
  fetchSensors,
  fetchSensor,
  parseDatasets,
  parseDataset,
} from '../../api/sensors';
import { fetchChallenges } from '../../api/challenges';
import { fetchSensorMeta } from '../../api/sensors';
import { ERROR_TYPES } from '../errors/actions';
import _ from 'lodash';

export const DATASET_TYPES = {
  FETCHING_DATASETS: 'FETCHING_DATASETS',
  FETCHING_DATASETS_ERROR: 'FETCHING_DATASETS_ERROR',

  FETCHING_DATASET: 'FETCHING_DATASET',
  FETCHING_DATASET_ERROR: 'FETCHING_DATASET_ERROR',

  CHALLENGING_DATASET: 'CHALLENGING_DATASET',

  DATASET_UPDATED_FILTER: 'DATASET_UPDATED_FILTER',
  FETCH_DATASET_COUNTER: 'FETCH_DATASET_COUNTER',
  FETCH_AVAILABLE_CATEGORIES: 'FETCH_AVAILABLE_CATEGORIES',
  FETCH_AVAILABLE_FILETYPES: 'FETCH_AVAILABLE_FILETYPES',
  UPDATE_CURRENT_PAGE: 'UPDATE_CURRENT_PAGE',
  UPDATE_ROWS_PER_PAGE: 'UPDATE_ROWS_PER_PAGE',
};

export const DATASET_ACTIONS = {
  fetchDatasets: _filter => {
    return (dispatch, getState) => {
      const state = getState();

      dispatch({
        type: DATASET_TYPES.FETCHING_DATASETS,
        value: true,
      });

      const filter = _filter ? _filter : state.datasets.filter;

      // Start with filtering only the datasets
      let filterUrlQuery = 'sensortype=DATASET&';

      // Filter on category
      if (filter.categories && filter.categories.length === 0)
        filterUrlQuery += `category=none`;
      else if (filter.categories && filter.categories.length === 1)
        filterUrlQuery += `category=${filter.categories[0]}`;
      else
        filterUrlQuery += map(filter.categories, cat => {
          return `category[]=${cat}`;
        }).join('&');

      filterUrlQuery += '&';

      // Filter on filetype
      if (filter.filetypes && filter.filetypes.length === 0)
        filterUrlQuery += `filetype=none`;
      else if (filter.filetypes && filter.filetypes.length === 1)
        filterUrlQuery += `filetype=${filter.filetypes[0]}`;
      else
        filterUrlQuery += map(filter.filetypes, type => {
          return `filetype[]=${type}`;
        }).join('&');

      if (_filter) {
        dispatch({
          type: DATASET_TYPES.DATASET_UPDATED_FILTER,
          filter,
        });
      }

      const { limit, start, sort } = filter;

      const anonymousAxiosClient = axios(null, true);
      const fetchDatasetCounter = state.datasets.fetchDatasetCounter + 1;

      // Counter to keep track of calls so when response arrives we can take the latest
      (counter => {
        fetchSensors(
          anonymousAxiosClient,
          {
            limit,
            start,
            sort,
            filterUrlQuery,
          },
          true
        )
          .then(async response => {
            if (counter !== getState().datasets.fetchDatasetCounter) {
              return;
            }
            const parsedResponse = parseDatasets(response.data.items);
            dispatch({
              type: DATASET_TYPES.FETCHING_DATASETS,
              value: false,
              datasets: parsedResponse,
              total: response.data.total,
            });

            // Dispatch an update with decorated purchase | ownership info
            if (localStorage.getItem('jwtToken')) {
              const authenticatedAxiosClient = axios(true);
              try {
                await decorateMetaInfo(
                  authenticatedAxiosClient,
                  parsedResponse
                );
              } catch (error) {
                // Only signal the authentication error - nothing else, it's only meta data
                if (error && error.response && error.response.status === 401) {
                  dispatch({
                    type: ERROR_TYPES.AUTHENTICATION_ERROR,
                    error,
                  });
                }
              }

              dispatch({
                type: DATASET_TYPES.FETCHING_DATASETS,
                value: false,
                datasets: parsedResponse,
                total: response.data.total,
              });
            }
          })
          .catch(error => {
            if (error && error.response && error.response.status === 401) {
              dispatch({
                type: ERROR_TYPES.AUTHENTICATION_ERROR,
                error,
              });
            }
            dispatch({
              type: DATASET_TYPES.FETCHING_DATASETS_ERROR,
              error,
            });
          });
      })(fetchDatasetCounter);
      dispatch({
        type: DATASET_TYPES.FETCH_DATASET_COUNTER,
        value: fetchDatasetCounter,
      });
    };
  },
  fetchDataset: (dispatch, dataset) => {
    return async (dispatch, getState) => {
      try {
        dispatch({
          type: DATASET_TYPES.FETCHING_DATASET,
          value: true,
        });

        const anonymousAxiosClient = axios(null, true);

        let response = await fetchSensor(anonymousAxiosClient, dataset);
        let parsedDataset = response.data.sensorid
          ? parseDataset(response.data)
          : {};

        const urlParametersChallenges = `listing=~${dataset}`;
        response = await fetchChallenges(
          anonymousAxiosClient,
          urlParametersChallenges
        );
        const challenges = response.data.items;
        parsedDataset.challengeslist = challenges;

        dispatch({
          type: DATASET_TYPES.FETCHING_DATASET,
          value: false,
          dataset: parsedDataset,
        });
      } catch (error) {
        if (error && error.response && error.response.status === 401) {
          dispatch({
            type: ERROR_TYPES.AUTHENTICATION_ERROR,
            error,
          });
        }
        dispatch({
          type: DATASET_TYPES.FETCHING_DATASET_ERROR,
          error,
        });
      }
    };
  },
  fetchAvailableFiletypes: () => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.FETCH_AVAILABLE_FILETYPES,
        availableFiletypes: {
          json: {
            name: 'json',
            id: 'json',
          },
          xls: {
            name: 'xls',
            id: 'xls',
          },
          csv: {
            name: 'csv',
            id: 'csv',
          },
        },
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
            id: 'agriculture',
          },
          environment: {
            name: 'Environment',
            id: 'environment',
          },
          health: {
            name: 'Health',
            id: 'health',
          },
          energy: {
            name: 'Energy',
            id: 'energy',
          },
        },
      });
    };
  },
  updateCurrentPage: currentPage => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.UPDATE_CURRENT_PAGE,
        page: currentPage,
      });
    };
  },
  updateRowsPerPage: rowsPerPage => {
    return (dispatch, getState) => {
      dispatch({
        type: DATASET_TYPES.UPDATE_ROWS_PER_PAGE,
        rows: rowsPerPage,
      });
    };
  },
};

async function decorateMetaInfo(axios, datasets) {
  const user = localStorage.getItem('address');
  if (!user || _.isEmpty(Object.keys(datasets))) {
    return;
  }

  const result = await fetchSensorMeta(axios, Object.keys(datasets), user);
  const purchases = {};
  for (const purchase of result[0].data.items) {
    purchases[purchase.sensor] = true;
  }

  const listings = {};
  for (const listing of result[1].data.items) {
    listings[listing.contractAddress] = true;
  }

  for (let sensor of Object.keys(datasets)) {
    datasets[sensor].purchased = purchases[sensor] === true;
    datasets[sensor].owned = listings[sensor] === true;
  }
}

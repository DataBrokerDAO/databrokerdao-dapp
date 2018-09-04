import map from 'lodash/map';
import axios from '../../utils/axios';
import {
  fetchSensors,
  fetchSensor,
  parseDatasets,
  parseDataset
} from '../../api/sensors';
import { fetchChallenges } from '../../api/challenges';
import { fetchSensorMeta } from '../../api/sensors';
import { ERROR_TYPES } from '../errors/actions';

export const DATASET_TYPES = {
  FETCHING_DATASETS: 'FETCHING_DATASETS',
  FETCHING_DATASETS_ERROR: 'FETCHING_DATASETS_ERROR',

  FETCHING_DATASET: 'FETCHING_DATASET',
  FETCHING_DATASET_ERROR: 'FETCHING_DATASET_ERROR',

  FETCHING_CHALLENGES: 'FETCHING_CHALLENGES',
  FETCHING_CHALLENGES_ERROR: 'FETCHING_CHALLENGES_ERROR',

  CHALLENGING_DATASET: 'CHALLENGING_DATASET',

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
            filterUrlQuery
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
              total: response.data.total
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
                    error
                  });
                }
              }

              dispatch({
                type: DATASET_TYPES.FETCHING_DATASETS,
                value: false,
                datasets: parsedResponse,
                total: response.data.total
              });
            }
          })
          .catch(error => {
            if (error && error.response && error.response.status === 401) {
              dispatch({
                type: ERROR_TYPES.AUTHENTICATION_ERROR,
                error
              });
            }
            dispatch({
              type: DATASET_TYPES.FETCHING_DATASETS_ERROR,
              error
            });
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
        type: DATASET_TYPES.FETCHING_DATASET,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);

      fetchSensor(authenticatedAxiosClient, dataset)
        .then(response => {
          let parsedResponse = response.data.sensorid
            ? parseDataset(response.data)
            : {};

          dispatch({
            type: DATASET_TYPES.FETCHING_DATASET,
            value: false,
            dataset: parsedResponse
          });

          dispatch({
            type: DATASET_TYPES.FETCHING_CHALLENGES,
            value: true
          });

          const urlParametersChallenges = `listing=${dataset}`;
          fetchChallenges(
            authenticatedAxiosClient,
            urlParametersChallenges
          ).then(response => {
            dispatch({
              type: DATASET_TYPES.FETCHING_CHALLENGES,
              value: false,
              challenges: response
            });
          });
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            dispatch({
              type: ERROR_TYPES.AUTHENTICATION_ERROR,
              error
            });
          }
          dispatch({
            type: DATASET_TYPES.FETCHING_CHALLENGES_ERROR,
            error
          });
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

async function decorateMetaInfo(axios, datasets) {
  const owner = localStorage.getItem('address');
  if (!owner) {
    return;
  }

  const metaPromises = [];
  for (let sensor of Object.keys(datasets)) {
    metaPromises.push(fetchSensorMeta(axios, sensor, owner));
  }
  const result = await Promise.all(metaPromises);

  let index = 0;
  for (let sensor of Object.keys(datasets)) {
    datasets[sensor].purchased = result[index][0].data.total === 1;
    datasets[sensor].owned = result[index][1].data.total === 1;
    index++;
  }
}

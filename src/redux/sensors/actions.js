import axios from '../../utils/axios';
import each from 'lodash/each';
import moment from 'moment';

import { ERROR_TYPES } from '../errors/actions';
import {
  getIpfsHashForMetadata,
  transactionReceipt,
  approveDtx,
  getSensorRegistryMeta,
  sensorChallenge,
  sensorChallengesCount,
  sensorChallengeRegistered
} from '../../api/util';
import {
  TX_IPFS_HASH,
  TX_APPROVE,
  TX_ENSURE_APPROVE,
  TX_CHALLENGE,
  TX_ENSURE_CHALLENGE,
  TX_VERIFY_CHALLENGE
} from '../../components/details/ChallengeSensorDialog';

export const SENSORS_TYPES = {
  FETCHING_DATASETS: 'FETCHING_DATASETS',
  FETCHING_DATASETS_ERROR: 'FETCHING_DATASETS_ERROR',
  UPDATE_DATASETS_PAGE: 'UPDATE_DATASETS_PAGE',

  FETCHING_STREAMS: 'FETCHING_STREAMS',
  FETCHING_STREAMS_ERROR: 'FETCHING_STREAMS_ERROR',
  UPDATE_STREAMS_PAGE: 'UPDATE_STREAMS_PAGE',

  CHALLENGING_SENSOR: 'CHALLENGING_SENSOR',
  CHALLENGING_SENSOR_ERROR: 'CHALLENGING_SENSOR_ERROR',

  TRANSACTION_INDEX: 'TRANSACTION_INDEX',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',

  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

export const SENSORS_ACTIONS = {
  clearErrors: () => {
    return dispatch => {
      dispatch({
        type: SENSORS_TYPES.CLEAR_ERRORS
      });
    };
  },
  fetchDatasets: (skip = 0, limit = 10, owner = null, email = null) => {
    return (dispatch, getState) => {
      dispatch({
        type: SENSORS_TYPES.FETCHING_DATASETS,
        value: true
      });

      const registry = email ? 'purchaseregistry' : 'sensorregistry';
      const endTime = null; // Datasets do not expire

      axios(true)
        .get(buildUrl(registry, 'DATASET', skip, limit, owner, email, endTime))
        .then(async response => {
          const items = await parseResponse(registry, response);
          dispatch({
            type: SENSORS_TYPES.FETCHING_DATASETS,
            value: false,
            datasets: items,
            rows: response.data.total
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
            type: SENSORS_TYPES.FETCHING_DATASETS_ERROR,
            error
          });
        });
    };
  },
  updateDatasetsPage: (page, rowsPerPage) => {
    return (dispatch, getState) => {
      dispatch({
        type: SENSORS_TYPES.UPDATE_DATASETS_PAGE,
        page,
        rowsPerPage
      });
    };
  },
  fetchStreams: (skip = 0, limit = 10, owner = null, email = null) => {
    return (dispatch, getState) => {
      dispatch({
        type: SENSORS_TYPES.FETCHING_STREAMS,
        value: true
      });

      const registry = email ? 'purchaseregistry' : 'sensorregistry';

      // Streams can expire, but we only want to fetch non expired streams when we are
      // fetching our purchases. If we fetch our listings (owner will be set) we want
      // to fetch all of them
      const endTime = owner ? null : `>${Math.ceil(moment.now() / 1000)}`;

      axios(true)
        .get(buildUrl(registry, '!DATASET', skip, limit, owner, email, endTime))
        .then(async response => {
          const items = await parseResponse(registry, response);
          dispatch({
            type: SENSORS_TYPES.FETCHING_STREAMS,
            value: false,
            streams: items,
            rows: response.data.total
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
            type: SENSORS_TYPES.FETCHING_STREAMS_ERROR,
            error
          });
        });
    };
  },
  challengeSensor: (sensor, reason, amount) => {
    return async (dispatch, getState) => {
      try {
        dispatch({
          type: SENSORS_TYPES.CHALLENGING_SENSOR,
          value: true
        });

        const responses = await getSensorRegistryMeta();
        const deployedTokenContractAddress = responses[0];
        const spenderAddress = responses[1];

        dispatch({
          type: SENSORS_TYPES.TRANSACTION_INDEX,
          index: TX_IPFS_HASH
        });
        const metadataHash = await getIpfsHashForMetadata({
          data: { reason }
        });

        dispatch({
          type: SENSORS_TYPES.TRANSACTION_INDEX,
          index: TX_APPROVE
        });
        let receiptUrl = await approveDtx(
          deployedTokenContractAddress,
          spenderAddress,
          amount
        );

        dispatch({
          type: SENSORS_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_APPROVE
        });
        await transactionReceipt(receiptUrl);

        dispatch({
          type: SENSORS_TYPES.TRANSACTION_INDEX,
          index: TX_CHALLENGE
        });
        receiptUrl = await sensorChallenge(sensor.key, amount, metadataHash);

        dispatch({
          type: SENSORS_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_CHALLENGE
        });
        await transactionReceipt(receiptUrl);

        dispatch({
          type: SENSORS_TYPES.TRANSACTION_INDEX,
          index: TX_VERIFY_CHALLENGE
        });
        const challenger = localStorage.getItem('address');
        await sensorChallengeRegistered(sensor.key, challenger);

        dispatch({
          type: SENSORS_TYPES.CHALLENGING_SENSOR,
          value: false
        });
      } catch (error) {
        if (error && error.response && error.response.status === 401) {
          dispatch({
            type: ERROR_TYPES.AUTHENTICATION_ERROR,
            error
          });
        }
        dispatch({
          type: SENSORS_TYPES.TRANSACTION_ERROR,
          value: true
        });
        dispatch({
          type: SENSORS_TYPES.CHALLENGING_SENSOR_ERROR,
          value: error
        });
        console.log(error);
      }
    };
  },
  updateStreamsPage: (page, rowsPerPage) => {
    return (dispatch, getState) => {
      dispatch({
        type: SENSORS_TYPES.UPDATE_STREAMS_PAGE,
        page,
        rowsPerPage
      });
    };
  }
};

function buildUrl(registry, type, skip, limit, owner, email, endTime) {
  let url = `/${registry}/list?skip=${skip}&limit=${limit}&item.sensortype=${type}`;
  if (owner) {
    url = `${url}&item.owner=~${owner}`;
  }
  if (email) {
    url = `${url}&item.email=${email}`;
  }
  if (endTime) {
    url = `${url}&item.endTime=${endTime}`;
  }
  return url;
}

async function parseResponse(registry, response) {
  const parsedResponse = [];
  const items = response.data.items;

  switch (registry) {
    case 'sensorregistry':
      each(items, item => {
        parsedResponse.push({
          key: item.key,
          name: item.name,
          type: item.type,
          filetype: item.filetype,
          category: item.category,
          updateinterval: item.updateinterval
        });
      });
      break;
    case 'purchaseregistry':
      const purchaseDetailCalls = items.map(getPurchaseDetails);
      const purchaseDetails = await Promise.all(purchaseDetailCalls);

      const sensorDetailCalls = items.map(getSensorDetails);
      const sensorDetails = await Promise.all(sensorDetailCalls);

      // Warning: do not store the parsed response in a dict,
      // it breaks paging
      for (let i = 0; i < items.length; i++) {
        const key = sensorDetails[i].data.contractAddress;

        // Only add purchases if they aren't expired yet
        const endTimeMs = purchaseDetails[i].data.endTime * 1000;
        if (!endTimeMs || endTimeMs > moment.now()) {
          parsedResponse.push({
            key,
            name: sensorDetails[i].data.name,
            type: sensorDetails[i].data.type,
            filetype: sensorDetails[i].data.filetype,
            category: sensorDetails[i].data.category,
            updateinterval: sensorDetails[i].data.updateinterval,
            sensortype: purchaseDetails[i].data.sensortype,
            endTime: purchaseDetails[i].data.endTime
          });
        }
      }
      break;
    default:
      throw new Error(`Unknown registry ${registry}`);
  }

  return parsedResponse;
}

function getSensorDetails(purchase) {
  return axios(true).get(`/sensor/${purchase.sensor}`);
}

function getPurchaseDetails(purchase) {
  return axios(true).get(`/purchase/${purchase.contractAddress}`);
}

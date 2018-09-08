import {
  getSensorRegistryMeta,
  approveDtx,
  sensorEnlisting,
  sensorEnlistingRegistered,
  sensorEnlistingCount,
  transactionReceipt,
  getIpfsHashForMetadata
} from '../../api/util';

import { ERROR_TYPES } from '../errors/actions';

import {
  TX_APPROVE,
  TX_ENLIST,
  TX_ENSURE_APPROVE,
  TX_ENSURE_ENLIST,
  TX_VERIFY_ENLIST,
  TX_IPFS_HASH
} from '../../components/listings/EnlistConfirmationDialog';

export const LISTING_TYPES = {
  ENLISTING_STREAM: 'ENLISTING_STREAM',
  ENLISTING_STREAM_ERROR: 'ENLISTING_STREAM_ERROR',
  ENLISTING_DATASET: 'ENLISTING_DATASET',
  ENLISTING_DATASET_ERROR: 'ENLISTING_DATASET_ERROR',
  TRANSACTION_INDEX: 'TRANSACTION_INDEX',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

export const LISTING_ACTIONS = {
  clearErrors: () => {
    return dispatch => {
      dispatch({
        type: LISTING_TYPES.CLEAR_ERRORS
      });
    };
  },
  enlistStream: stream => {
    return async (dispatch, getState) => {
      try {
        dispatch({
          type: LISTING_TYPES.ENLISTING_STREAM,
          value: true
        });

        const responses = await getSensorRegistryMeta();
        const deployedTokenContractAddress = responses[0];
        const spenderAddress = responses[1];

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_IPFS_HASH
        });
        const metadataHash = await getIpfsHashForMetadata({
          data: {
            name: stream.name,
            geo: {
              lat: stream.lat,
              lng: stream.lng
            },
            type: stream.type,
            sensorid: stream.sensorid,
            example: stream.example,
            updateinterval: stream.updateinterval * 1000
          }
        });

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_APPROVE
        });
        let receiptUrl = await approveDtx(
          deployedTokenContractAddress,
          spenderAddress,
          stream.stake
        );

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_APPROVE
        });
        await transactionReceipt(receiptUrl);

        // This is not pretty but we don't have a sensor key, so good enough for now.
        // It will wait until there's current count + 1 listings for the owner
        const owner = localStorage.getItem('address');
        const count = await sensorEnlistingCount(owner, '!DATASET');

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_ENLIST
        });
        receiptUrl = await sensorEnlisting(
          stream.stake,
          stream.price,
          metadataHash
        );

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_ENLIST
        });
        await transactionReceipt(receiptUrl);

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_VERIFY_ENLIST
        });
        await sensorEnlistingRegistered(count + 1, owner, '!DATASET');

        dispatch({
          type: LISTING_TYPES.ENLISTING_STREAM,
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
          type: LISTING_TYPES.TRANSACTION_ERROR,
          value: true
        });
        dispatch({
          type: LISTING_TYPES.ENLISTING_STREAM_ERROR,
          value: error
        });
      }
    };
  },
  enlistDataset: dataset => {
    return async (dispatch, getState) => {
      try {
        dispatch({
          type: LISTING_TYPES.ENLISTING_DATASET,
          value: true
        });

        const responses = await getSensorRegistryMeta();
        const deployedTokenContractAddress = responses[0];
        const spenderAddress = responses[1];

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_IPFS_HASH
        });
        const metadataHash = await getIpfsHashForMetadata({
          data: {
            name: dataset.name,
            category: dataset.category,
            filetype: dataset.filetype,
            example: dataset.example,
            sensorid: dataset.sensorid,
            sensortype: dataset.sensortype,
            credentials: { url: dataset.url }
          }
        });

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_APPROVE
        });
        let receiptUrl = await approveDtx(
          deployedTokenContractAddress,
          spenderAddress,
          dataset.stake
        );

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_APPROVE
        });
        await transactionReceipt(receiptUrl);

        // This is not pretty but we don't have a sensor key, so good enough for now.
        // It will wait until there's current count + 1 listings for the owner
        const owner = localStorage.getItem('address');
        const count = await sensorEnlistingCount(owner, 'DATASET');

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_ENLIST
        });
        receiptUrl = await sensorEnlisting(
          dataset.stake,
          dataset.price,
          metadataHash
        );

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_ENLIST
        });
        await transactionReceipt(receiptUrl);

        dispatch({
          type: LISTING_TYPES.TRANSACTION_INDEX,
          index: TX_VERIFY_ENLIST
        });
        await sensorEnlistingRegistered(count + 1, owner, 'DATASET');

        dispatch({
          type: LISTING_TYPES.ENLISTING_DATASET,
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
          type: LISTING_TYPES.TRANSACTION_ERROR,
          value: true
        });
        dispatch({
          type: LISTING_TYPES.ENLISTING_DATASET_ERROR,
          value: error
        });
      }
    };
  }
};

import {
  prepareDtxSpendFromSensorRegistry,
  dtxApproval,
  sensorEnlisting
} from '../../api/util';

import { ERROR_TYPES } from '../errors/actions';

export const LISTING_TYPES = {
  ENLISTING_STREAM: 'ENLISTING_STREAM',
  ENLISTING_STREAM_ERROR: 'ENLISTING_STREAM_ERROR',
  ENLISTING_DATASET: 'ENLISTING_DATASET',
  ENLISTING_DATASET_ERROR: 'ENLISTING_DATASET_ERROR'
};

export const LISTING_ACTIONS = {
  enlistStream: stream => {
    return (dispatch, getState) => {
      dispatch({
        type: LISTING_TYPES.ENLISTING_STREAM,
        value: true
      });

      const metadata = {
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
      };

      try {
        prepareDtxSpendFromSensorRegistry(metadata)
          .then(async responses => {
            const deployedTokenContractAddress = responses[0];
            const spenderAddress = responses[1];
            const metadataHash = responses[2];

            await dtxApproval(
              deployedTokenContractAddress,
              spenderAddress,
              stream.stake
            );
            await sensorEnlisting(stream.stake, stream.price, metadataHash);

            dispatch({
              type: LISTING_TYPES.ENLISTING_STREAM,
              value: false
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
              type: LISTING_TYPES.ENLISTING_STREAM_ERROR,
              value: error
            });
          });
      } catch (error) {
        if (error && error.response && error.response.status === 401) {
          dispatch({
            type: ERROR_TYPES.AUTHENTICATION_ERROR,
            error
          });
        }
        dispatch({
          type: LISTING_TYPES.ENLISTING_STREAM_ERROR,
          value: error
        });
      }
    };
  },
  enlistDataset: dataset => {
    return (dispatch, getState) => {
      dispatch({
        type: LISTING_TYPES.ENLISTING_DATASET,
        value: true
      });

      const metadata = {
        data: {
          name: dataset.name,
          category: dataset.category,
          filetype: dataset.filetype,
          example: dataset.example,
          sensorid: dataset.sensorid,
          sensortype: dataset.sensortype,
          credentials: { url: dataset.url }
        }
      };

      try {
        prepareDtxSpendFromSensorRegistry(metadata)
          .then(async responses => {
            const deployedTokenContractAddress = responses[0];
            const spenderAddress = responses[1];
            const metadataHash = responses[2];

            await dtxApproval(
              deployedTokenContractAddress,
              spenderAddress,
              dataset.stake
            );

            await sensorEnlisting(dataset.stake, dataset.price, metadataHash);

            dispatch({
              type: LISTING_TYPES.ENLISTING_DATASET,
              value: false
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
              type: LISTING_TYPES.ENLISTING_DATASET_ERROR,
              value: error
            });
          });
      } catch (error) {
        if (error && error.response && error.response.status === 401) {
          dispatch({
            type: ERROR_TYPES.AUTHENTICATION_ERROR,
            error
          });
        }
        dispatch({
          type: LISTING_TYPES.ENLISTING_DATASET_ERROR,
          value: error
        });
      }
    };
  }
};

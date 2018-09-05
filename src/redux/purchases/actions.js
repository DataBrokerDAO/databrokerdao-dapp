import axios from '../../utils/axios';
import moment from 'moment';
import localStorage from '../../localstorage';
import {
  dtxApproval,
  sensorPurchase,
  sensorPurchaseRegistered,
  prepareDtxSpendFromPurchaseRegistry
} from '../../api/util';

import { ERROR_TYPES } from '../errors/actions';

export const PURCHASES_TYPES = {
  FETCHING_PURCHASE: 'FETCHING_PURCHASE',
  FETCHING_PURCHASE_ERROR: 'FETCHING_PURCHASE_ERROR',
  PURCHASING_ACCESS: 'PURCHASING_ACCESS',
  PURCHASING_ACCESS_ERROR: 'PURCHASING_ACCESS_ERROR'
};

export const PURCHASES_ACTIONS = {
  fetchPurchase: (key, sensor, purchaser) => {
    return (dispatch, getState) => {
      dispatch({
        type: PURCHASES_TYPES.FETCHING_PURCHASE,
        value: true
      });

      const url = key
        ? `/purchase/${key}`
        : `/purchaseregistry/list?item.sensor=~${sensor}&item.purchaser=~${purchaser}`;

      axios(true)
        .get(url)
        .then(async response => {
          const purchase =
            response.data.total === 1 ? response.data.items[0] : null;
          dispatch({
            type: PURCHASES_TYPES.FETCHING_PURCHASE,
            value: false,
            purchase
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
            type: PURCHASES_TYPES.FETCHING_PURCHASE_ERROR,
            error
          });
        });
    };
  },
  purchaseAccess: (stream, endTime) => {
    return (dispatch, getState) => {
      dispatch({
        type: PURCHASES_TYPES.PURCHASING_ACCESS,
        value: true
      });

      // Multiply price for streams, use the indicated price for datasets that are a forever-purchase
      let purchasePrice;
      if (endTime === 0) {
        purchasePrice = stream.price;
      } else {
        const duration = moment.duration(moment(endTime).diff(moment()));
        purchasePrice = stream.price * duration;
      }

      const metadata = {
        data: {
          sensortype: stream.sensortype || 'STREAM', // default to stream type, since old streams are not enlisted with the sensortype property.
          email: localStorage.getItem('email')
        }
      };

      try {
        prepareDtxSpendFromPurchaseRegistry(metadata)
          .then(async responses => {
            const deployedTokenContractAddress = responses[0];
            const spenderAddress = responses[1];
            const metadataHash = responses[2];

            await dtxApproval(
              deployedTokenContractAddress,
              spenderAddress,
              purchasePrice
            );

            await sensorPurchase(stream.key, endTime, metadataHash);

            await sensorPurchaseRegistered(
              stream.key,
              localStorage.getItem('email')
            );

            dispatch({
              type: PURCHASES_TYPES.PURCHASING_ACCESS,
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
              type: PURCHASES_TYPES.PURCHASING_ACCESS_ERROR,
              error
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
          type: PURCHASES_TYPES.PURCHASING_ACCESS_ERROR,
          error
        });
      }
    };
  },
  updateCurrentPage: (type, page) => {
    return (dispatch, getState) => {
      dispatch({ type, page });
    };
  },
  updateRowsPerPage: (type, rows) => {
    return (dispatch, getState) => {
      dispatch({ type, rows });
    };
  }
};

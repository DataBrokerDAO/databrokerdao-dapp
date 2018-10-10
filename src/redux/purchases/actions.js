import axios from '../../utils/axios';
import moment from 'moment';
import localStorage from '../../localstorage';
import {
  approveDtx,
  sensorPurchase,
  sensorPurchaseRegistered,
  getPurchaseRegistryMeta,
  getIpfsHashForMetadata,
  transactionReceipt
} from '../../api/util';

import { ERROR_TYPES } from '../errors/actions';
import {
  TX_APPROVE,
  TX_ENSURE_APPROVE,
  TX_PURCHASE,
  TX_ENSURE_PURCHASE,
  TX_VERIFY_PURCHASE
} from '../../components/details/PurchaseSensorDialog';

export const PURCHASES_TYPES = {
  FETCHING_PURCHASE: 'FETCHING_PURCHASE',
  FETCHING_PURCHASE_ERROR: 'FETCHING_PURCHASE_ERROR',
  PURCHASING_ACCESS: 'PURCHASING_ACCESS',
  PURCHASING_ACCESS_ERROR: 'PURCHASING_ACCESS_ERROR',
  TRANSACTION_INDEX: 'TRANSACTION_INDEX',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  TOGGLE_DELIVERY_EXPLAINER: 'TOGGLE_DELIVERY_EXPLAINER',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

export const PURCHASES_ACTIONS = {
  clearErrors: () => {
    return dispatch => {
      dispatch({
        type: PURCHASES_TYPES.CLEAR_ERRORS
      });
    };
  },
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
            response.data.total >= 1
              ? response.data.items[response.data.total - 1]
              : null;
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
    return async (dispatch, getState) => {
      try {
        dispatch({
          type: PURCHASES_TYPES.PURCHASING_ACCESS,
          value: true
        });

        const responses = await getPurchaseRegistryMeta();
        const deployedTokenContractAddress = responses[0];
        const spenderAddress = responses[1];

        // Multiply price for streams, use the indicated price for datasets that are a forever-purchase
        let purchasePrice;
        if (endTime === 0) {
          purchasePrice = stream.price;
        } else {
          const intervalMs = stream.updateinterval;
          const durationMs = moment(endTime).diff(moment());
          const numIntervals = Math.ceil(durationMs / intervalMs);
          purchasePrice = stream.price * numIntervals;
        }

        const metadataHash = await getIpfsHashForMetadata({
          data: {
            sensortype: stream.sensortype || 'STREAM', // default to stream type, since old streams are not enlisted with the sensortype property.
            email: localStorage.getItem('email')
          }
        });

        dispatch({
          type: PURCHASES_TYPES.TRANSACTION_INDEX,
          index: TX_APPROVE
        });
        let receiptUrl = await approveDtx(
          deployedTokenContractAddress,
          spenderAddress,
          purchasePrice
        );

        dispatch({
          type: PURCHASES_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_APPROVE
        });
        await transactionReceipt(receiptUrl);

        dispatch({
          type: PURCHASES_TYPES.TRANSACTION_INDEX,
          index: TX_PURCHASE
        });
        receiptUrl = await sensorPurchase(stream.key, endTime, metadataHash);

        dispatch({
          type: PURCHASES_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_PURCHASE
        });
        await transactionReceipt(receiptUrl);

        dispatch({
          type: PURCHASES_TYPES.TRANSACTION_INDEX,
          index: TX_VERIFY_PURCHASE
        });

        const purchaser = localStorage.getItem('address');
        const purchase = await sensorPurchaseRegistered(stream.key, purchaser);

        if (!purchase) {
          dispatch({
            type: PURCHASES_TYPES.TRANSACTION_ERROR,
            value: true
          });
          dispatch({
            type: PURCHASES_TYPES.PURCHASING_ACCESS_ERROR,
            error: 'Purchase was not synced'
          });
        } else {
          dispatch({
            type: PURCHASES_TYPES.FETCHING_PURCHASE,
            value: false,
            purchase
          });
        }

        dispatch({
          type: PURCHASES_TYPES.PURCHASING_ACCESS,
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
          type: PURCHASES_TYPES.TRANSACTION_ERROR,
          value: true
        });
        dispatch({
          type: PURCHASES_TYPES.PURCHASING_ACCESS_ERROR,
          error
        });
      }
    };
  },
  toggleDeliveryExplainer: () => {
    return dispatch => {
      dispatch({
        type: PURCHASES_TYPES.TOGGLE_DELIVERY_EXPLAINER
      });
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

import axios from '../../utils/axios';
import moment from 'moment';
import localStorage from '../../localstorage';
import {
  dtxApproval,
  sensorPurchase,
  sensorRegistered,
  prepareDtxSpendFromPurchaseRegistry
} from '../../api/util';

export const PURCHASES_TYPES = {
  FETCHING_DATASETS: 'FETCHING_DATASETS',
  FETCHING_STREAMS: 'FETCHING_STREAMS',
  FETCHED_DATASETS: 'FETCHED_DATASETS',
  FETCHED_STREAMS: 'FETCHED_STREAMS',
  PURCHASE_ACCESS: 'PURCHASE_ACCESS',
  PURCHASING_ACCESS: 'PURCHASING_ACCESS',
  UPDATE_CURRENT_PAGE_DATASETS: 'UPDATE_CURRENT_PAGE_DATASETS',
  UPDATE_CURRENT_PAGE_STREAMS: 'UPDATE_CURRENT_PAGE_STREAMS',
  UPDATE_ROWS_PER_PAGE_DATASETS: 'UPDATE_ROWS_PER_PAGE_DATASETS',
  UPDATE_ROWS_PER_PAGE_STREAMS: 'UPDATE_ROWS_PER_PAGE_STREAMS'
};

export const PURCHASES_ACTIONS = {
  fetchPurchases: (skip = 0, limit = 10, endTime = null) => {
    if (endTime === null) {
      const ts = Math.ceil(moment.now() / 1000);
      endTime = `>${ts}`;
    }

    return (dispatch, getState) => {
      const fetchDataset = endTime === 0;
      dispatch({
        type: fetchDataset
          ? PURCHASES_TYPES.FETCHING_DATASETS
          : PURCHASES_TYPES.FETCHING_STREAMS,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);

      function getSensorDetails(purchase) {
        return authenticatedAxiosClient.get(`/sensor/${purchase.sensor}`);
      }

      function getPurchaseDetails(purchase) {
        return authenticatedAxiosClient.get(
          `/purchase/${purchase.contractAddress}`
        );
      }

      const email = localStorage.getItem('email');
      authenticatedAxiosClient
        .get(
          `/purchaseregistry/list?item.email=${email}&skip=${skip}&limit=${limit}&item.endTime=${endTime}`
        )
        .then(async response => {
          const purchases = response.data.items;

          const purchaseDetailCalls = purchases.map(getPurchaseDetails);
          const purchaseDetails = await Promise.all(purchaseDetailCalls);

          const sensorDetailCalls = purchases.map(getSensorDetails);
          const sensorDetails = await Promise.all(sensorDetailCalls);

          // Warning: do not store the parsed response in a dict,
          // it breaks paging
          let parsedResponse = [];
          for (let i = 0; i < purchases.length; i++) {
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

          dispatch({
            type: fetchDataset
              ? PURCHASES_TYPES.FETCHED_DATASETS
              : PURCHASES_TYPES.FETCHED_STREAMS,
            items: parsedResponse,
            total: response.data.total
          });
        })
        .catch(error => {
          console.log(error);
        });
    };
  },
  purchaseAccess: (stream, endTime) => {
    return (dispatch, getState) => {
      dispatch({
        type: PURCHASES_TYPES.PURCHASING_ACCESS,
        value: true
      });

      const authenticatedAxiosClient = axios(true);

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

          await sensorRegistered(stream.key, localStorage.getItem('email'));

          dispatch({
            type: PURCHASES_TYPES.PURCHASING_ACCESS,
            value: false
          });
        })
        .catch(error => {
          console.log(error);
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

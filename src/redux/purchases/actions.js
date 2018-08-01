import each from 'lodash/each';
import axios from '../../utils/axios';
import moment from 'moment';
import localStorage from '../../localstorage';
import { asyncRetry } from '../../utils/async';

export const PURCHASES_TYPES = {
  FETCH_PURCHASES: 'FETCH_PURCHASES',
  FETCHING_PURCHASES: 'FETCHING_PURCHASES',
  PURCHASE_ACCESS: 'PURCHASE_ACCESS',
  PURCHASING_ACCESS: 'PURCHASING_ACCESS'
};

export const PURCHASES_ACTIONS = {
  fetchPurchases: () => {
    return (dispatch, getState) => {
      dispatch({
        type: PURCHASES_TYPES.FETCHING_PURCHASES,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);

      function getStreamDetails(streamKey) {
        return authenticatedAxiosClient.get(
          `/sensorregistry/list?item.key${streamKey}`
        );
      }

      const email = localStorage.getItem('email');
      authenticatedAxiosClient
        .get(`/purchaseregistry/list?email=${email}`)
        .then(response => {
          const purchases = response.data.items;

          const streamDetailCalls = [];
          each(purchases, purchase => {
            streamDetailCalls.push(getStreamDetails(purchase.sensor));
          });

          Promise.all(streamDetailCalls).then(streamDetails => {
            const parsedResponse = [];

            for (let i = 0; i < purchases.length; i++) {
              parsedResponse.push({
                key: purchases[i].sensor,
                name: streamDetails[i].data.name,
                type: streamDetails[i].data.type,
                sensortype: streamDetails[i].data.sensortype,
                endTime: purchases[i].endtime,
                updateinterval: streamDetails[i].data.updateinterval
              });
            }

            dispatch({
              type: PURCHASES_TYPES.FETCH_PURCHASES,
              purchases: parsedResponse
            });
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

      const authenticatedAxiosClient = axios(null, true);

      // Multiply price for streams, use the indicated price for datasets that are a forever-purchase

      let purchasePrice;
      let duration;
      if (endTime === 0) {
        purchasePrice = stream.price;
      } else {
        duration = moment.duration(moment(endTime).diff(moment()));
        purchasePrice = stream.price * duration;
      }

      function getDtxTokenRegistry() {
        return authenticatedAxiosClient.get('/dtxtokenregistry/list');
      }

      function getPurchaseRegistry() {
        return authenticatedAxiosClient.get('/purchaseregistry/list');
      }

      function getMetadataHash() {
        return authenticatedAxiosClient.post('/ipfs/add/json', {
          data: {
            sensortype: stream.sensortype || 'STREAM', // default to stream type, since old streams are not enlisted with the sensortype property.
            email: localStorage.getItem('email')
          }
        });
      }

      Promise.all([
        getDtxTokenRegistry(),
        getPurchaseRegistry(),
        getMetadataHash()
      ])
        .then(async responses => {
          const deployedTokenContractAddress =
            responses[0].data.items[0].contractaddress;
          const spenderAddress = responses[1].data.base.key;
          const metadataHash = responses[2].data[0].hash;

          // Time to approve the tokens
          let url = `/dtxtoken/${deployedTokenContractAddress}/approve`;
          let response = await authenticatedAxiosClient.post(url, {
            _spender: spenderAddress, // The contract that will spend the tokens (some function of the contract will)
            _value: purchasePrice.toString()
          });
          let uuid = response.data.uuid;
          let receipt = await asyncRetry(
            authenticatedAxiosClient,
            `${url}/${uuid}`
          );
          console.log(receipt);

          //Tokens have been allocated - now we can make the purchase!
          url = `/purchaseregistry/purchaseaccess`;
          response = await authenticatedAxiosClient.post(url, {
            _sensor: stream.key,
            _endtime:
              endTime !== 0
                ? moment(endTime)
                    .unix()
                    .toString()
                : '0',
            _metadata: metadataHash
          });
          uuid = response.data.uuid;
          receipt = await asyncRetry(
            authenticatedAxiosClient,
            `${url}/${uuid}`
          );
          console.log(receipt);

          dispatch({
            type: PURCHASES_TYPES.PURCHASING_ACCESS,
            value: false
          });
        })
        .catch(error => {
          console.log(error);
        });
    };
  }
};

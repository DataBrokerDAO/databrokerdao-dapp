import each from 'lodash/each';
import axios from '../../utils/axios';
import { BigNumber } from 'bignumber.js';
import localStorage from '../../localstorage';
import { asyncRetry } from '../../utils/async';

export const LISTING_TYPES = {
  FETCH_LISTINGS: 'FETCH_LISTINGS',
  FETCHING_LISTINGS: 'FETCHING_LISTINGS',
  ENLISTING_STREAM: 'ENLISTING_STREAM'
};

export const LISTING_ACTIONS = {
  fetchListings: () => {
    return (dispatch, getState) => {
      dispatch({
        type: LISTING_TYPES.FETCHING_LISTINGS,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);

      const address = localStorage.getItem('address');
      authenticatedAxiosClient
        .get(`/sensorregistry/list?limit=10&owner=~${address}`)
        .then(response => {
          const listings = response.data.items;

          const parsedResponse = [];
          each(listings, listing => {
            parsedResponse.push({
              key: listing.key,
              name: listing.name,
              type: listing.type,
              updateinterval: listing.updateinterval
            });
          });

          dispatch({
            type: LISTING_TYPES.FETCH_LISTINGS,
            listings: parsedResponse
          });
        })
        .catch(error => {
          console.log(error);
        });
    };
  },
  enlistStream: stream => {
    return (dispatch, getState) => {
      dispatch({
        type: LISTING_TYPES.ENLISTING_STREAM,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);

      function getDtxTokenRegistry() {
        return authenticatedAxiosClient.get('/dtxtokenregistry/list');
      }

      function getStreamRegistry() {
        return authenticatedAxiosClient.get('/sensorregistry/list');
      }

      function getMetadataHash() {
        return authenticatedAxiosClient.post('/ipfs/add/json', {
          data: {
            name: stream.name,
            geo: {
              lat: stream.lat,
              lng: stream.lng
            },
            type: stream.type,
            example: stream.example,
            updateinterval: stream.updateinterval * 1000
          }
        });
      }

      Promise.all([
        getDtxTokenRegistry(),
        getStreamRegistry(),
        getMetadataHash()
      ]).then(async responses => {
        const deployedTokenContractAddress =
          responses[0].data.items[0].contractAddress;
        const spenderAddress = responses[1].data.base.contractAddress;
        const metadataHash = responses[2].data[0].hash;

        try {
          let url = `/dtxtoken/${deployedTokenContractAddress}/approve`;
          let response = await authenticatedAxiosClient.post(url, {
            _spender: spenderAddress,
            _value: BigNumber(stream.stake)
              .times(BigNumber(10).pow(18))
              .toString()
          });
          let uuid = response.data.uuid;
          let receipt = await asyncRetry(
            authenticatedAxiosClient,
            `${url}/${uuid}`
          );
          console.log(receipt);

          url = `/sensorregistry/enlist`;
          response = await authenticatedAxiosClient.post(
            `/sensorregistry/enlist`,
            {
              _stakeAmount: BigNumber(stream.stake)
                .times(BigNumber(10).pow(18))
                .toString(),
              _price: BigNumber(stream.price)
                .times(BigNumber(10).pow(18))
                .toString(),
              _metadata: metadataHash
            }
          );
          uuid = response.data.uuid;
          receipt = await asyncRetry(
            authenticatedAxiosClient,
            `${url}/${uuid}`
          );
          console.log(receipt);

          dispatch({
            type: LISTING_TYPES.ENLISTING_STREAM,
            value: false
          });
        } catch (error) {
          console.log('Failed enlisting with error: ', error);
        }
      });
    };
  }
};

import each from 'lodash/each';
import axios from '../../utils/axios';
import { BigNumber } from 'bignumber.js';
import localStorage from '../../localstorage';
import { transactionReceipt } from '../../utils/wait-for-it';

export const LISTING_TYPES = {
  ENLISTING_STREAM: 'ENLISTING_STREAM',
  FETCHING_STREAM_LISTINGS: 'FETCHING_STREAM_LISTINGS',
  FETCHED_STREAM_LISTINGS: 'FETCHED_STREAM_LISTINGS',
  UPDATE_CURRENT_PAGE_STREAMS: 'UPDATE_CURRENT_PAGE_STREAMS',
  UPDATE_ROWS_PER_PAGE_STREAMS: 'UPDATE_ROWS_PER_PAGE_STREAMS',

  ENLISTING_DATASET: 'ENLISTING_DATASET',
  FETCHING_DATASET_LISTINGS: 'FETCHING_DATASET_LISTINGS',
  FETCHED_DATASET_LISTINGS: 'FETCHED_DATASET_LISTINGS',
  UPDATE_CURRENT_PAGE_DATASETS: 'UPDATE_CURRENT_PAGE_DATASETS',
  UPDATE_ROWS_PER_PAGE_DATASETS: 'UPDATE_ROWS_PER_PAGE_DATASETS'
};

export const LISTING_ACTIONS = {
  fetchListings: (skip = 0, limit = 10, endTime = null) => {
    const sensortype = endTime === 0 ? 'DATASET' : '!DATASET';

    return (dispatch, getState) => {
      if (endTime === 0) {
        dispatch({
          type: LISTING_TYPES.FETCHING_DATASET_LISTINGS,
          value: true
        });
      } else {
        dispatch({
          type: LISTING_TYPES.FETCHING_STREAM_LISTINGS,
          value: true
        });
      }

      const authenticatedAxiosClient = axios(null, true);

      const address = localStorage.getItem('address');
      authenticatedAxiosClient
        .get(
          `/sensorregistry/list?skip=${skip}&limit=${limit}&item.sensortype=${sensortype}&item.owner=~${address}`
        )
        .then(response => {
          const listings = response.data.items;

          const parsedResponse = [];
          each(listings, listing => {
            parsedResponse.push({
              key: listing.key,
              name: listing.name,
              type: listing.type,
              filetype: listing.filetype,
              category: listing.category,
              updateinterval: listing.updateinterval
            });
          });

          if (endTime === 0) {
            dispatch({
              type: LISTING_TYPES.FETCHED_DATASET_LISTINGS,
              datasets: parsedResponse,
              total: response.data.total
            });
          } else {
            dispatch({
              type: LISTING_TYPES.FETCHED_STREAM_LISTINGS,
              streams: parsedResponse,
              total: response.data.total
            });
          }
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
            sensorid: stream.sensorid,
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
          let receipt = await transactionReceipt(
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
          receipt = await transactionReceipt(
            authenticatedAxiosClient,
            `${url}/${uuid}`
          );

          dispatch({
            type: LISTING_TYPES.ENLISTING_STREAM,
            value: false
          });
        } catch (error) {
          console.log('Failed enlisting with error: ', error);
        }
      });
    };
  },
  enlistDataset: dataset => {
    return (dispatch, getState) => {
      dispatch({
        type: LISTING_TYPES.ENLISTING_DATASET,
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
            name: dataset.name,
            category: dataset.category,
            filetype: dataset.filetype,
            example: dataset.example,
            sensorid: dataset.sensorid,
            sensortype: dataset.sensortype,
            credentials: { url: dataset.url }
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
            _value: BigNumber(dataset.stake)
              .times(BigNumber(10).pow(18))
              .toString()
          });
          let uuid = response.data.uuid;
          let receipt = await transactionReceipt(
            authenticatedAxiosClient,
            `${url}/${uuid}`
          );
          console.log(receipt);

          url = `/sensorregistry/enlist`;
          response = await authenticatedAxiosClient.post(
            `/sensorregistry/enlist`,
            {
              _stakeAmount: BigNumber(dataset.stake)
                .times(BigNumber(10).pow(18))
                .toString(),
              _price: BigNumber(dataset.price)
                .times(BigNumber(10).pow(18))
                .toString(),
              _metadata: metadataHash
            }
          );
          uuid = response.data.uuid;
          receipt = await transactionReceipt(
            authenticatedAxiosClient,
            `${url}/${uuid}`
          );

          dispatch({
            type: LISTING_TYPES.ENLISTING_DATASET,
            value: false
          });
        } catch (error) {
          console.log('Failed enlisting with error: ', error);
        }
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

import each from 'lodash/each';
import axios from '../../utils/axios';
import localStorage from '../../localstorage';
import {
  prepareDtxSpendFromSensorRegistry,
  dtxApproval,
  sensorEnlisting
} from '../../api/util';

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
    const fetchDataset = endTime === 0;
    const sensortype = fetchDataset ? 'DATASET' : '!DATASET';

    return (dispatch, getState) => {
      dispatch({
        type: fetchDataset
          ? LISTING_TYPES.FETCHING_DATASET_LISTINGS
          : LISTING_TYPES.FETCHING_STREAM_LISTINGS,
        value: true
      });

      const address = localStorage.getItem('address');
      const authenticatedAxiosClient = axios(true);

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

          dispatch({
            type: fetchDataset
              ? LISTING_TYPES.FETCHED_DATASET_LISTINGS
              : LISTING_TYPES.FETCHED_STREAM_LISTINGS,
            items: parsedResponse,
            total: response.data.total
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

      prepareDtxSpendFromSensorRegistry(metadata)
        .then(async responses => {
          const deployedTokenContractAddress = responses[0];
          const spenderAddress = responses[1];
          const metadataHash = responses[2];

          try {
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
          } catch (error) {
            console.log('Failed enlisting stream with error: ', error);
          }
        })
        .catch(error => {
          console.log('Failed preparing enlist call: ', error);
        });
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

      prepareDtxSpendFromSensorRegistry(metadata)
        .then(async responses => {
          const deployedTokenContractAddress = responses[0];
          const spenderAddress = responses[1];
          const metadataHash = responses[2];

          try {
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
          } catch (error) {
            console.log('Failed enlisting dataset with error: ', error);
          }
        })
        .catch(error => {
          console.log('Failed preparing enlist call: ', error);
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

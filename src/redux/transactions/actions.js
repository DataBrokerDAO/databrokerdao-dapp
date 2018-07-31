import chain from 'lodash/chain';
import axios from '../../utils/axios';

export const TRANSACTIONS_TYPES = {
  FETCHING_TRANSACTIONS: 'FETCHING_TRANSACTIONS',
  FETCH_TRANSACTIONS: 'FETCH_TRANSACTIONS',
  FETCH_TRANSACTION_TYPES: 'FETCH_TRANSACTION_TYPES'
};

export const TRANSACTIONS_ACTIONS = {
  fetchTransactions: _filter => {
    return async (dispatch, getState) => {
      const state = getState();

      dispatch({
        type: TRANSACTIONS_TYPES.FETCHING_TRANSACTIONS,
        value: true
      });

      const filter = _filter ? _filter : state.transactions.filter;

      console.log(filter);

      const authenticatedAxiosClient = axios(null, true);

      // Filters
      let url = `/events?skip=${filter.start}&limit=${filter.limit}&sort=${
        filter.sort
      }`;
      if (filter.type !== '') url += `&event=${filter.type}`;
      if (filter.startDate && filter.endDate)
        url += `&blockTime=>=${convertDateToTimestamp(
          filter.startDate
        )}&blockTime=<=${convertDateToTimestamp(filter.endDate)}`;

      const retrieveResponse = await authenticatedAxiosClient.get(url);
      const { events, total } = retrieveResponse.data;

      dispatch({
        type: TRANSACTIONS_TYPES.FETCH_TRANSACTIONS,
        payload: { events, total }
      });
    };
  },

  fetchTransactionTypes: () => {
    return async (dispatch, getState) => {
      const authenticatedAxiosClient = axios(null, true);

      const retrieveResponse = await authenticatedAxiosClient.get(`/contracts`);

      const { data } = retrieveResponse;

      const transactionTypes = chain(data.contracts)
        .flatMap('contract.abi')
        .filter(i => i.type === 'event' && !i.name.includes('CacheInvalidated'))
        .value();

      transactionTypes.unshift({
        name: 'All'
      });

      dispatch({
        type: TRANSACTIONS_TYPES.FETCH_TRANSACTION_TYPES,
        payload: transactionTypes
      });
    };
  }
};

function convertDateToTimestamp(date) {
  return date.getTime() / 1000;
}

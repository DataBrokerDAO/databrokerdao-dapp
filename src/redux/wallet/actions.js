import axios from '../../utils/axios';
import { transactionReceipt } from '../../utils/wait-for-it';

export const WALLET_TYPES = {
  FETCH_WALLET: 'FETCH_WALLET',
  FETCHING_WALLET: 'FETCHING_WALLET',
  MINTING_TOKENS: 'MINTING_TOKENS'
};

export const WALLET_ACTIONS = {
  fetchWallet: () => {
    return (dispatch, getState) => {
      dispatch({
        type: WALLET_TYPES.FETCHING_WALLET,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);
      authenticatedAxiosClient
        .get('/wallet/balance')
        .then(response => {
          const wallet = response.data.DTX;

          dispatch({
            type: WALLET_TYPES.FETCH_WALLET,
            wallet
          });
        })
        .catch(error => {
          console.log(error);
        });
    };
  },
  mintTokens: amount => {
    return async (dispatch, getState) => {
      dispatch({
        type: WALLET_TYPES.MINTING_TOKENS,
        value: true
      });

      try {
        const authenticatedAxiosClient = axios(null, true);
        let url = '/dtxminter/mint';
        let response = await authenticatedAxiosClient.post(url, {
          _amount: amount
        });

        let uuid = response.data.uuid;
        let receipt = await transactionReceipt(
          authenticatedAxiosClient,
          `${url}/${uuid}`
        );
        console.log(receipt);

        dispatch({
          type: WALLET_TYPES.MINTING_TOKENS,
          value: false
        });

        response = await authenticatedAxiosClient.get('/wallet/balance');
        const wallet = response.data.DTX;

        dispatch({
          type: WALLET_TYPES.FETCH_WALLET,
          wallet
        });
      } catch (error) {
        console.log(error);
      }
    };
  }
};

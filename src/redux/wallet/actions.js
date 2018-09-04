import axios from '../../utils/axios';
import { dtxMint } from '../../api/util';
import { ERROR_TYPES } from '../errors/actions';

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

      axios(true)
        .get('/wallet/balance')
        .then(response => {
          const dtxWallet = response.data.DTX;
          dispatch({
            type: WALLET_TYPES.FETCH_WALLET,
            wallet: dtxWallet
          });
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            dispatch({
              type: ERROR_TYPES.AUTHENTICATION_ERROR,
              error
            });
          }
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
        await dtxMint(amount);
        const response = await axios(true).get('/wallet/balance?force=true');

        dispatch({
          type: WALLET_TYPES.MINTING_TOKENS,
          value: false
        });

        dispatch({
          type: WALLET_TYPES.FETCH_WALLET,
          wallet: response.data.DTX
        });
      } catch (error) {
        console.log(error);
      }
    };
  }
};

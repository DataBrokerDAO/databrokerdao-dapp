import axios from '../../utils/axios';
import { dtxMint } from '../../api/util';

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
        dispatch({
          type: WALLET_TYPES.MINTING_TOKENS,
          value: false
        });

        const response = await axios(true).get('/wallet/balance');
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

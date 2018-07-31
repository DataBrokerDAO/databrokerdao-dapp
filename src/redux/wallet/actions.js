import axios from '../../utils/axios';

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
    return (dispatch, getState) => {
      dispatch({
        type: WALLET_TYPES.MINTING_TOKENS,
        value: true
      });

      const authenticatedAxiosClient = axios(null, true);
      authenticatedAxiosClient
        .post('/dtxminter/mint', {
          _amount: amount
        })
        .then(response => {
          dispatch({
            type: WALLET_TYPES.MINTING_TOKENS,
            value: false
          });
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
        })
        .catch(error => {
          console.log(error);
        });
    };
  }
};

import axios from '../../utils/axios';
import { dtxMint, transactionReceipt } from '../../api/util';
import { ERROR_TYPES } from '../errors/actions';
import {
  TX_MINTING,
  TX_VERIFY_MINT,
  TX_ENSURE_MINTING
} from '../../components/wallet/MintConfirmationDialog';

export const WALLET_TYPES = {
  FETCH_WALLET: 'FETCH_WALLET',
  FETCHING_WALLET: 'FETCHING_WALLET',
  MINTING_TOKENS: 'MINTING_TOKENS',

  TRANSACTION_INDEX: 'TRANSACTION_INDEX',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR'
};

export const WALLET_ACTIONS = {
  fetchWallet: () => {
    return async (dispatch, getState) => {
      dispatch({
        type: WALLET_TYPES.FETCHING_WALLET,
        value: true
      });

      try {
        const wallets = await axios(true).get('/wallet/balance');
        const dtxWallet = wallets.data.DTX;
        dispatch({
          type: WALLET_TYPES.FETCH_WALLET,
          wallet: dtxWallet
        });
      } catch (error) {
        if (error && error.response && error.response.status === 401) {
          dispatch({
            type: ERROR_TYPES.AUTHENTICATION_ERROR,
            error
          });
        }
        console.log(error);
      }
    };
  },
  mintTokens: amount => {
    return async (dispatch, getState) => {
      try {
        dispatch({
          type: WALLET_TYPES.MINTING_TOKENS,
          value: true
        });

        dispatch({
          type: WALLET_TYPES.TRANSACTION_INDEX,
          index: TX_MINTING
        });
        const receiptUrl = await dtxMint(amount);

        dispatch({
          type: WALLET_TYPES.TRANSACTION_INDEX,
          index: TX_ENSURE_MINTING
        });
        await transactionReceipt(receiptUrl);

        dispatch({
          type: WALLET_TYPES.TRANSACTION_INDEX,
          index: TX_VERIFY_MINT
        });
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
        if (error && error.response && error.response.status === 401) {
          dispatch({
            type: ERROR_TYPES.AUTHENTICATION_ERROR,
            error
          });
        }
        dispatch({
          type: WALLET_TYPES.TRANSACTION_ERROR,
          error
        });
      }
    };
  }
};

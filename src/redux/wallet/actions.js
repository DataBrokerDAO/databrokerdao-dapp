import axios from '../../utils/axios';
import * as bridgeAPI from '../../api/bridge';
import {
  TX_BALANCE_CHECK,
  TX_DEPOSIT_APPROVE,
  TX_DEPOSIT_TRANSFER
} from '../../components/wallet/DepositDtxDialog';
import { ERROR_TYPES } from '../errors/actions';

export const WALLET_TYPES = {
  FETCH_WALLET: 'FETCH_WALLET',

  FETCHING_WALLET: 'FETCHING_WALLET',
  FETCHING_WALLET_ERROR: 'FETCHING_WALLET_ERROR',

  PROVIDER_CONNECTED: 'PROVIDER_CONNECTED',

  FETCHING_SENDER_BALANCE: 'FETCHING_SENDER_BALANCE',
  FETCHING_SENDER_BALANCE_ERROR: 'FETCHING_SENDER_BALANCE_ERROR',

  DEPOSITING_TOKENS: 'DEPOSITING_TOKENS',
  DEPOSITING_TOKENS_ERROR: 'DEPOSITING_TOKENS_ERROR',

  TRANSACTION_INDEX: 'TRANSACTION_INDEX',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',

  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

export const WALLET_ACTIONS = {
  clearErrors: () => {
    return dispatch => {
      dispatch({
        type: WALLET_TYPES.CLEAR_ERRORS
      });
    };
  },

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
        dispatch({
          type: WALLET_TYPES.FETCH_WALLET_ERROR,
          error
        });
        console.log(error);
      }
    };
  },

  fetchSenderBalance: () => async dispatch => {
    dispatch({ type: WALLET_TYPES.FETCHING_SENDER_BALANCE, value: true });

    try {
      const { sender, mainNetDTX } = await connect(dispatch);
      const balance = await bridgeAPI.getBalanceOf(mainNetDTX, sender);
      dispatch({
        type: WALLET_TYPES.FETCHING_SENDER_BALANCE,
        value: false,
        senderBalance: balance.toString(10)
      });
    } catch (error) {
      dispatch({
        type: WALLET_TYPES.FETCHING_SENDER_BALANCE_ERROR,
        error
      });
    }
  },

  depositTokens: (amount, recipient) => async dispatch => {
    if (!amount || !recipient) {
      return;
    }

    dispatch({
      type: WALLET_TYPES.DEPOSITING_TOKENS,
      value: true,
      amount,
      recipient
    });

    try {
      dispatch({
        type: WALLET_TYPES.TRANSACTION_INDEX,
        index: TX_BALANCE_CHECK
      });

      const {
        web3,
        sender,
        mainNetDTX,
        databrokerDTX,
        databrokerWeb3
      } = await connect(dispatch);

      const senderBalance = await bridgeAPI.getBalanceOf(mainNetDTX, sender);
      if (senderBalance < amount) {
        throw new Error('Balance too low');
      }

      dispatch({
        type: WALLET_TYPES.TRANSACTION_INDEX,
        index: TX_DEPOSIT_APPROVE
      });
      await bridgeAPI.approveDeposit(
        web3,
        mainNetDTX,
        sender,
        recipient,
        amount
      );

      dispatch({
        type: WALLET_TYPES.TRANSACTION_INDEX,
        index: TX_DEPOSIT_TRANSFER
      });
      const currentBlockNum = await databrokerWeb3.eth.getBlockNumber();
      await bridgeAPI.waitForTransfer(
        databrokerDTX,
        recipient,
        amount,
        currentBlockNum
      );

      dispatch({
        type: WALLET_TYPES.DEPOSITING_TOKENS,
        value: false
      });
    } catch (error) {
      dispatch({
        type: WALLET_TYPES.DEPOSITING_TOKENS_ERROR,
        error
      });
      dispatch({
        type: WALLET_TYPES.TRANSACTION_ERROR,
        error
      });
      console.log(error);
    }
  }
};

async function connectToProvider() {
  const web3 = await bridgeAPI.getMainNetWeb3();
  const databrokerWeb3 = await bridgeAPI.getDatabrokerWeb3();
  const sender = await bridgeAPI.fetchAccount(web3);

  if (!sender) {
    throw new Error('Provider connected but no account found');
  }

  const mainNetDTX = await bridgeAPI.fetchMainNetDTX(web3);
  const databrokerDTX = await bridgeAPI.fetchDatabrokerDTX(databrokerWeb3);

  return { web3, sender, mainNetDTX, databrokerWeb3, databrokerDTX };
}

async function connect(dispatch) {
  let result;
  while (true) {
    try {
      result = await connectToProvider();
      break;
    } catch (err) {
      console.error(
        'Could not connect to provider, retrying after timeout',
        err
      );
      await bridgeAPI.timeout(5e3);
    }
  }

  dispatch({
    type: WALLET_TYPES.PROVIDER_CONNECTED,
    address: result.sender
  });

  return result;
}

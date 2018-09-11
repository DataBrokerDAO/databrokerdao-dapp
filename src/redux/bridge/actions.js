import { ERROR_TYPES } from "../errors/actions";
import * as bridgeAPI from "../../api/bridge";
import { replace } from 'react-router-redux'

export const BRIDGE_TYPES = {
  PROVIDER_CONNECTED: "PROVIDER_CONNECTED",

  FETCH_SENDER_BALANCE: "FETCH_SENDER_BALANCE",
  FETCH_SENDER_BALANCE_SUCCESS: "FETCH_SENDER_BALANCE_SUCCESS",

  INIT_DEPOSIT: "INIT_DEPOSIT",
  APPROVE_DEPOSIT_SUCCESS: "APPROVE_DEPOSIT_SUCCESS",
  APPROVE_DEPOSIT_FAILURE: "APPROVE_DEPOSIT_FAILURE",
  DEPOSIT_SUCCESS: "DEPOSIT_SUCCESS",
  DEPOSIT_FAILURE: "DEPOSIT_FAILURE",
};

async function connectToProvider() {
  const web3 = await bridgeAPI.getMainNetWeb3();
  const databrokerWeb3 = await bridgeAPI.getDatabrokerWeb3();

  const sender = await bridgeAPI.fetchAccount(web3);

  if (!sender) {
    throw new Error("Provider connected but no account found");
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
      console.error(err);
      await bridgeAPI.timeout(5e3);
    }
  }

  dispatch({
    type: BRIDGE_TYPES.PROVIDER_CONNECTED,
    payload: { address: result.sender }
  });

  return result;
}

const fetchSenderBalance = () => async dispatch => {
  dispatch({ type: BRIDGE_TYPES.FETCH_SENDER_BALANCE });

  const { sender, mainNetDTX } = await connect(dispatch);

  const balance = await bridgeAPI.getBalanceOf(mainNetDTX, sender);
  dispatch({
    type: BRIDGE_TYPES.FETCH_SENDER_BALANCE_SUCCESS,
    payload: { senderBalance: balance.toString(10) }
  });
}

const requestDeposit = (amount, recipient) => async dispatch => {
  if (!amount || !recipient) {
    return;
  }
  dispatch({ type: BRIDGE_TYPES.INIT_DEPOSIT, payload: { amount, recipient } });
  dispatch(replace("/bridge/pending"));

  const { web3, sender, mainNetDTX, databrokerDTX, databrokerWeb3 } = await connect(dispatch);

  const senderBalance = await bridgeAPI.getBalanceOf(mainNetDTX, sender);

  if (senderBalance < amount) {
    throw new Error("Balance too low");
  }

  const currentBlockNum = await databrokerWeb3.eth.getBlockNumber();

  try {
    const tx = await bridgeAPI.approveDeposit(web3, mainNetDTX, sender, recipient, amount);
    dispatch({ type: BRIDGE_TYPES.APPROVE_DEPOSIT_SUCCESS, payload: { tx } });
  } catch (err) {
    dispatch({ type: BRIDGE_TYPES.APPROVE_DEPOSIT_FAILURE });
  }


  try {
    await bridgeAPI.waitForTransfer(databrokerDTX, recipient, amount, currentBlockNum);
    dispatch({ type: BRIDGE_TYPES.DEPOSIT_SUCCESS });
    dispatch(replace("/bridge/success"));
  } catch (err) {
    dispatch({ type: BRIDGE_TYPES.DEPOSIT_FAILURE });
    dispatch(replace("/bridge/success"));
  }
}

export const BRIDGE_ACTIONS = {
  fetchSenderBalance,
  requestDeposit
};

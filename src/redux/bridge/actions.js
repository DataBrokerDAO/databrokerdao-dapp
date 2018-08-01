import { ERROR_TYPES } from "../errors/actions";
import { STREAMS_ACTIONS } from "../streams/actions";
import * as DTXToken from "../../assets/DTXToken.json";
import { getBalance, waitForEvent } from "./utils";
import axios from '../../utils/axios';

export const BRIDGE_TYPES = {
  SET_LOCATION: "SET_LOCATION",

  METAMASK_CONNECTED: "METAMASK_CONNECTED",

  FETCH_SENDER_BALANCE: "FETCH_SENDER_BALANCE",
  FETCH_SENDER_BALANCE_SUCCESS: "FETCH_SENDER_BALANCE_SUCCESS",

  INIT_DEPOSIT: "INIT_DEPOSIT",
  APPROVE_DEPOSIT_SUCCESS: "APPROVE_DEPOSIT_SUCCESS",
  APPROVE_DEPOSIT_FAILURE: "APPROVE_DEPOSIT_FAILURE",
  DEPOSIT_SUCCESS: "DEPOSIT_SUCCESS",
  DEPOSIT_FAILURE: "DEPOSIT_FAILURE",
};

const Web3 = require("web3");
async function getWeb3() {
  return new Web3(window.web3.currentProvider);
}
async function fetchSender(web3) {
  return (await web3.eth.getAccounts())[0];
}

const options = {
  HOME_TOKEN: process.env.REACT_APP_HOME_TOKEN,
  FOREIGN_TOKEN: process.env.REACT_APP_FOREIGN_TOKEN,
  HOME_BRIDGE: process.env.REACT_APP_HOME_BRIDGE,
  FOREIGN_URL: process.env.REACT_APP_RPC_URL
}

async function fetchDTXToken(web3, address) {
  return await new web3.eth.Contract(DTXToken.abi, address);
}

export async function connectToMetaMask(dispatch) {
  const web3 = await getWeb3();
  const sender = await fetchSender(web3);

  dispatch({
    type: BRIDGE_TYPES.METAMASK_CONNECTED,
    payload: { address: sender }
  });

  if (!options.HOME_TOKEN) {
    throw new Error("REACT_APP_HOME_TOKEN env variable has not been set.");
  }

  const mainNetDTX = await fetchDTXToken(web3, options.HOME_TOKEN);
  const databrokerWeb3 = await new Web3(new Web3.providers.HttpProvider(options.FOREIGN_URL))
  const databrokerDTX = await fetchDTXToken(databrokerWeb3, options.FOREIGN_TOKEN);

  return { web3, sender, mainNetDTX, databrokerWeb3, databrokerDTX };
}

async function approveDeposit(web3, token, from, receiver, amount) {
  const call = await token.methods.approveAndCall(options.HOME_BRIDGE, amount, receiver);
  const gas = (await call.estimateGas({ from })) * 2;
  const gasPrice = (await web3.eth.getGasPrice()) * 2;
  return await call.send({
      from,
      gasPrice,
      gas
  });
}


export const BRIDGE_ACTIONS = {
  fetchSenderBalance: () => async dispatch => {
    dispatch({ type: BRIDGE_TYPES.FETCH_SENDER_BALANCE });

    const { web3, sender, mainNetDTX } = await connectToMetaMask(dispatch);

    const balance = await getBalance(mainNetDTX, sender); 
    dispatch({
      type: BRIDGE_TYPES.FETCH_SENDER_BALANCE_SUCCESS,
      payload: { senderBalance: balance.toString(10) }
    });
  },
  requestDeposit: (amount, recipient) => async dispatch => {
    if (!amount || !recipient) {
      return;
    }
    dispatch({ type: BRIDGE_TYPES.INIT_DEPOSIT, payload: { amount } });

    const { web3, sender, mainNetDTX, databrokerDTX, databrokerWeb3 } = await connectToMetaMask(dispatch);

    const senderBalance = await getBalance(mainNetDTX, sender); 

    if (senderBalance < amount) {
      throw new Error("Balance too low");
    }

    const currentBlockNum = await databrokerWeb3.eth.getBlockNumber(); 

    try {
      const tx = await approveDeposit(web3, mainNetDTX, sender, recipient, amount);
      dispatch({ type: BRIDGE_TYPES.APPROVE_DEPOSIT_SUCCESS, payload: { tx } });
    } catch(err) {
      dispatch({ type: BRIDGE_TYPES.APPROVE_DEPOSIT_FAILURE });
    }


    try {
      await waitForEvent({
        contract: databrokerDTX,
        event: "Transfer",
        fromBlock: currentBlockNum,
        filter: { to: recipient, amount: amount },
        timeoutMs: 5e5
      });
      dispatch({ type: BRIDGE_TYPES.DEPOSIT_SUCCESS });
    } catch(err) {
      dispatch({ type: BRIDGE_TYPES.DEPOSIT_FAILURE });
    }

    await BRIDGE_ACTIONS.fetchSenderBalance()(dispatch);
  },
  updateLocation: () => dispatch => {
    if (navigator === "undefined") {
      dispatch({
        type: ERROR_TYPES.LOCATION_ERROR,
        error: "geolocation is not supported"
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords: location }) => {
          const { latitude: lat, longitude: lng } = location;

          dispatch(STREAMS_ACTIONS.setCenter({ lat, lng }));
          dispatch({
            type: BRIDGE_TYPES.SET_LOCATION,
            location
          });
        },
        ({ message: error }) =>
          dispatch({
            type: ERROR_TYPES.LOCATION_ERROR,
            error
          })
      );
    }
  }
};

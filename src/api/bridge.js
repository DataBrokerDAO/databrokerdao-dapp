import Web3 from 'web3';
import * as DTXToken from '../assets/DTXToken.json';
import * as HomeBridge from '../assets/HomeBridge.json';
import * as ForeignBridge from '../assets/ForeignBridge.json';
import { approveAndCallDtx, transactionReceipt } from './util';
import { convertDtxToWei } from '../utils/transforms';

const options = {
  HOME_TOKEN: process.env.REACT_APP_HOME_TOKEN,
  FOREIGN_TOKEN: process.env.REACT_APP_FOREIGN_TOKEN,
  HOME_BRIDGE: process.env.REACT_APP_HOME_BRIDGE,
  FOREIGN_BRIDGE: process.env.REACT_APP_FOREIGN_BRIDGE,
  FOREIGN_URL: process.env.REACT_APP_RPC_URL
};

export async function getMainNetWeb3() {
  const provider = await waitForProvider();
  return new Web3(provider);
}

export async function getDatabrokerWeb3() {
  return await new Web3(new Web3.providers.HttpProvider(options.FOREIGN_URL));
}

export async function requestWithdrawal(amount, recipient) {
  const receiptUrl = await approveAndCallDtx(
    options.FOREIGN_TOKEN,
    options.FOREIGN_BRIDGE,
    amount,
    recipient
  );
  const receipt = await transactionReceipt(receiptUrl);
  return receipt.transactionHash;
}

export async function approveDeposit(web3, token, from, receiver, amount) {
  const call = await token.methods.approveAndCall(
    options.HOME_BRIDGE,
    amount,
    receiver
  );

  const gas = (await call.estimateGas({ from })) * 2;
  const gasPrice = (await web3.eth.getGasPrice()) * 2;

  const result = await call.send({
    from,
    gasPrice,
    gas
  });

  return result;
}

export async function fetchAccount(web3) {
  return (await web3.eth.getAccounts())[0];
}

export async function fetchHomeBridge() {
  const web3 = await getMainNetWeb3();
  return await new web3.eth.Contract(HomeBridge.abi, options.HOME_BRIDGE);
}

export async function fetchForeignBridge() {
  const web3 = await getDatabrokerWeb3();
  return await new web3.eth.Contract(ForeignBridge.abi, options.FOREIGN_BRIDGE);
}

async function fetchDTX(web3, address) {
  return await new web3.eth.Contract(DTXToken.abi, address);
}

export const fetchMainNetDTX = web3 => fetchDTX(web3, options.HOME_TOKEN);
export const fetchDatabrokerDTX = web3 => fetchDTX(web3, options.FOREIGN_TOKEN);

export async function getBalanceOf(token, address, from = address) {
  const val = await token.methods.balanceOf(address).call({ from });
  return parseInt(val, 10);
}

export async function waitForTransfer(token, recipient, amount, blockNumber) {
  await waitForEvent({
    contract: token,
    event: 'Transfer',
    fromBlock: blockNumber,
    filter: { to: recipient, amount },
    timeoutMs: 6e5
  });
}

/**
 * Catch all validator signatures until the request is granted
 * We need those signatures to excecute the withdrawal.
 */
export async function awaitWithdrawRequestSignatures(
  fromBlock,
  _transactionHash
) {
  const bridge = await fetchForeignBridge();
  const filter = { _transactionHash };

  await waitForEvent({
    contract: bridge,
    event: 'WithdrawRequestGranted',
    filter,
    fromBlock,
    timeoutMs: 6e5
  });

  const signatures = new Map();
  const events = await pollForEvents(
    bridge,
    'WithdrawRequestSigned',
    filter,
    fromBlock
  );
  for (const { returnValues } of events) {
    signatures.set(returnValues._signer, returnValues);
  }

  const v = [];
  const r = [];
  const s = [];
  let withdrawBlock;

  signatures.forEach(signature => {
    withdrawBlock = signature._withdrawBlock;
    v.push(signature._v);
    r.push(signature._r);
    s.push(signature._s);
  });

  if (v.length < 1) {
    throw new Error('Withdraw was granted but no signatures were found');
  }

  return { v, r, s, withdrawBlock };
}

// export async function estimateWithdrawGasCosts(
//   web3,
//   from,
//   amount,
//   withdrawBlock,
//   v,
//   r,
//   s
// ) {
//   const homeToken = await fetchMainNetDTX(web3);
//   const homeBridge = await this.fetchHomeBridge();
//   const call = homeBridge.methods.withdraw(
//     homeToken._address,
//     from,
//     amount,
//     withdrawBlock,
//     v,
//     r,
//     s
//   );

//   const gasEstimate = await call.estimateGas();
//   const gasEstimateSafe = Math.ceil(gasEstimate * 2);
//   return gasEstimateSafe;
// }

export async function executeWithdraw(
  web3,
  from,
  amount,
  withdrawBlock,
  v,
  r,
  s
) {
  const homeToken = await fetchMainNetDTX(web3);
  const homeBridge = await this.fetchHomeBridge();
  const call = homeBridge.methods.withdraw(
    homeToken._address,
    from,
    convertDtxToWei(amount),
    withdrawBlock,
    v,
    r,
    s
  );
  const result = await call.send({ from });
  return result;
}

// Utils
export const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

async function pollForEvents(contract, eventName, filter = {}, fromBlock) {
  let events = [];
  while (events.length == 0) {
    events = await contract.getPastEvents(eventName, {
      filter,
      fromBlock,
      toBlock: 'latest'
    });
    await timeout(2e3);
  }
  return events;
}

async function waitForEvent({
  contract,
  event,
  filter,
  fromBlock,
  timeoutMs = 60e3
}) {
  const res = await Promise.race([
    pollForEvents(contract, event, filter, fromBlock),
    timeout(timeoutMs)
  ]);
  if (!res) {
    throw new Error('event polling timeout');
  }
  return res[res.length - 1];
}

// See https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md
const waitForProvider = () =>
  new Promise((resolve, reject) => {
    if (window.web3) {
      resolve(window.web3.currentProvider);
      return;
    }
    if (window.ethereum) {
      resolve(window.ethereum);
      return;
    }
    window.addEventListener('message', ({ data }) => {
      if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
        resolve(window.ethereum);
      }
    });
    // Request provider
    window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
  });

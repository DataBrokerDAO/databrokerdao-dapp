import axios from '../utils/axios';
import moment from 'moment';
import { convertDtxToWei } from '../utils/transforms';
import { default as retry } from '../utils/async_retry';

const anonymousAxiosClient = axios(null, true);

export function getDtxTokenAddress() {
  return anonymousAxiosClient.get('/dtxtokenregistry/list').then(response => {
    return response.data.items[0].contractAddress;
  });
}

export function getSensorRegistryAddress() {
  return anonymousAxiosClient.get('/sensorregistry/list').then(response => {
    return response.data.base.contractAddress;
  });
}

export function getPurchaseRegistryAddress() {
  return anonymousAxiosClient.get('/purchaseregistry/list').then(response => {
    return response.data.base.contractAddress;
  });
}

export function hashMetaData(metadata) {
  return anonymousAxiosClient
    .post('/ipfs/add/json', metadata)
    .then(response => {
      return response.data[0].hash;
    });
}

export async function dtxApproval(
  dtxTokenAddress,
  spenderAddress,
  amountInDtx
) {
  const url = `/dtxtoken/${dtxTokenAddress}/approve`;
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(url, {
    _spender: spenderAddress,
    _value: convertDtxToWei(amountInDtx)
  });

  const receipt = await transactionReceipt(`${url}/${response.data.uuid}`);
  return receipt;
}

export async function sensorEnlisting(stakeInDtx, priceInDtx, metadataHash) {
  const url = '/sensorregistry/enlist';
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(
    `/sensorregistry/enlist`,
    {
      _stakeAmount: convertDtxToWei(stakeInDtx),
      _price: convertDtxToWei(priceInDtx),
      _metadata: metadataHash
    }
  );
  const receipt = await transactionReceipt(`${url}/${response.data.uuid}`);
  return receipt;
}

export async function sensorPurchase(sensorKey, endTime, metadataHash) {
  const url = `/purchaseregistry/purchaseaccess`;
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(url, {
    _sensor: sensorKey,
    _endTime:
      endTime !== 0
        ? moment(endTime)
            .unix()
            .toString()
        : '0',
    _metadata: metadataHash
  });

  const receipt = await transactionReceipt(`${url}/${response.data.uuid}`);
  return receipt;
}

export async function sensorChallenge(sensorKey, amount, metadataHash) {
  const url = '/sensorregistry/challenge';
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(url, {
    _listing: sensorKey,
    _stakeAmount: amount,
    _metadata: metadataHash
  });

  const receipt = await transactionReceipt(`${url}/${response.data.uuid}`);
  return receipt;
}

export async function dtxMint(amount) {
  const url = '/dtxminter/mint';
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(url, {
    _amount: amount
  });

  const receipt = await transactionReceipt(`${url}/${response.data.uuid}`);
  return receipt;
}

export async function sensorEnlistingCount(owner, type) {
  const authenticatedAxiosClient = axios(true);
  const url = `/sensorregistry/list?item.owner=~${owner}&item.sensortype=${type}`;
  const response = await authenticatedAxiosClient.get(url);
  if (response.data && response.data.items) {
    return response.data.total;
  }
}

export async function sensorEnlistingRegistered(count, owner, type) {
  const s = await enlisting(count, owner, type);
  return s;
}

export async function sensorPurchaseRegistered(sensorKey, email) {
  const s = await purchase(sensorKey, email);
  return s;
}

export function prepareDtxSpendFromSensorRegistry(metadata) {
  return Promise.all([
    getDtxTokenAddress(),
    getSensorRegistryAddress(),
    hashMetaData(metadata)
  ]);
}

export function prepareDtxSpendFromPurchaseRegistry(metadata) {
  return Promise.all([
    getDtxTokenAddress(),
    getPurchaseRegistryAddress(),
    hashMetaData(metadata)
  ]);
}

async function purchase(sensor, email) {
  const authenticatedAxiosClient = axios(true);
  return await retry(
    async bail => {
      const url = `/purchaseregistry/list?item.email=${email}`;
      const response = await authenticatedAxiosClient.get(url);

      if (response.data && response.data.items) {
        const purchases = response.data.items;
        for (let i = 0; i < purchases.length; i++) {
          if (purchases[i].sensor === sensor) {
            return purchases[i];
          }
        }
      } else {
        bail(new Error('Unexpected response format'));
      }

      throw new Error('Sensor not yet purchased');
    },
    {
      factor: 1,
      minTimeout: 1000,
      maxTimeout: 1000,
      retries: 120
    }
  );
}

async function enlisting(count, owner, type) {
  const authenticatedAxiosClient = axios(true);
  return await retry(
    async bail => {
      const url = `/sensorregistry/list?item.owner=~${owner}&item.sensortype=${type}`;
      const response = await authenticatedAxiosClient.get(url);
      if (response.data.total >= count) {
        return true;
      }

      throw new Error('Sensor not yet enlisted');
    },
    {
      factor: 1,
      minTimeout: 1000,
      maxTimeout: 1000,
      retries: 120
    }
  );
}

async function transactionReceipt(url) {
  const authenticatedAxiosClient = axios(true);
  return await retry(
    async bail => {
      const res = await authenticatedAxiosClient.get(url);

      if (res.data) {
        if (res.data.receipt) {
          if (res.data.receipt.status === 1) {
            return res.data.receipt;
          } else {
            bail(new Error(`Tx with hash ${res.data.hash} was reverted`));
            return;
          }
        }

        if (res.data.error) {
          bail(new Error(`Tx errored:  ${res.data.error}`));
          return;
        }
      }

      throw new Error('Tx not mined yet');
    },
    {
      factor: 1,
      minTimeout: 1000,
      maxTimeout: 1000,
      retries: 120
    }
  );
}

import axios from '../utils/axios';
import moment from 'moment';
import { convertDtxToWei } from '../utils/transforms';
import { default as retry } from '../utils/async_retry';

const anonymousAxiosClient = axios(null, true);

export async function approveDtx(dtxTokenAddress, spenderAddress, amountInDtx) {
  const url = `/dtxtoken/${dtxTokenAddress}/approve`;
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(url, {
    _spender: spenderAddress,
    _value: convertDtxToWei(amountInDtx)
  });

  return `${url}/${response.data.uuid}`;
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

  return `${url}/${response.data.uuid}`;
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

  return `${url}/${response.data.uuid}`;
}

export async function sensorChallenge(sensorKey, amount, metadataHash) {
  const url = '/sensorregistry/challenge';
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(url, {
    _listing: sensorKey,
    _stakeAmount: amount,
    _metadata: metadataHash
  });

  return `${url}/${response.data.uuid}`;
}

export async function dtxMint(amount) {
  const url = '/dtxminter/mint';
  const authenticatedAxiosClient = axios(true);
  const response = await authenticatedAxiosClient.post(url, {
    _amount: amount
  });

  return `${url}/${response.data.uuid}`;
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
  const authenticatedAxiosClient = axios(true);
  await retry(
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

export async function sensorChallengesCount(sensor, type) {
  const authenticatedAxiosClient = axios(true);
  const url = `/challengeregistry/list?item.listing=~${sensor}`;
  const response = await authenticatedAxiosClient.get(url);
  if (response.data && response.data.items) {
    return response.data.total;
  }
}

export async function sensorChallengeRegistered(count, sensor) {
  const authenticatedAxiosClient = axios(true);
  await retry(
    async bail => {
      const url = `/challengeregistry/list?item.listing=~${sensor}`;
      const response = await authenticatedAxiosClient.get(url);
      if (response.data.total >= count) {
        return true;
      }

      throw new Error('Sensor not yet challenged');
    },
    {
      factor: 1,
      minTimeout: 1000,
      maxTimeout: 1000,
      retries: 120
    }
  );
}

export async function sensorPurchaseRegistered(sensor, email) {
  const authenticatedAxiosClient = axios(true);
  const purchase = await retry(
    async bail => {
      const url = `/purchaseregistry/list?item.sensor=~${sensor}&item.email=${email}`;
      const response = await authenticatedAxiosClient.get(url);
      if (response.data && response.data.total >= 1) {
        return response.data.items[response.data.total - 1];
      }
      throw Error('Purchase not registered yet');
    },
    {
      factor: 1.1,
      minTimeout: 500,
      maxTimeout: 1000,
      retries: 120
    }
  );
  return purchase;
}

export function getSensorRegistryMeta() {
  return Promise.all([getDtxTokenAddress(), getSensorRegistryAddress()]);
}

export function getPurchaseRegistryMeta() {
  return Promise.all([getDtxTokenAddress(), getPurchaseRegistryAddress()]);
}

export function getIpfsHashForMetadata(metadata) {
  return anonymousAxiosClient
    .post('/ipfs/add/json', metadata)
    .then(response => {
      return response.data[0].hash;
    });
}

export async function transactionReceipt(url) {
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

function getDtxTokenAddress() {
  return anonymousAxiosClient.get('/dtxtokenregistry/list').then(response => {
    return response.data.items[0].contractAddress;
  });
}

function getSensorRegistryAddress() {
  return anonymousAxiosClient.get('/sensorregistry/list').then(response => {
    return response.data.base.contractAddress;
  });
}

function getPurchaseRegistryAddress() {
  return anonymousAxiosClient.get('/purchaseregistry/list').then(response => {
    return response.data.base.contractAddress;
  });
}

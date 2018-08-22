const retry = require('./async_retry');

export async function sensorPurchase(authenticatedAxiosClient, sensor, email) {
  return await retry(
    async bail => {
      const url = `/purchaseregistry/list?item.email=${email}`;
      const response = await authenticatedAxiosClient.get(url);

      if (response.data && response.data.items) {
        const purchases = response.data.items;
        for (let i = 0; i < purchases.length; i++) {
          if (purchases[i].sensor === sensor) {
            return true;
          }
        }
      } else {
        bail(new Error('Unexpected response format'));
      }

      throw new Error('Sensor not yet purchased');
    },
    {
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000, // ms
      retries: 12 // This means we'll wait a little over 1 min. max
    }
  );
}

export async function transactionReceipt(authenticatedAxiosClient, url) {
  return await retry(
    async bail => {
      const res = await authenticatedAxiosClient.get(url);
      if (!(res.data && res.data.receipt)) {
        throw new Error('Tx not mined yet');
      }

      if (res.data.receipt.status === 0) {
        bail(new Error(`Tx with hash ${res.data.hash} was reverted`));
        return;
      }

      return res.data.receipt;
    },
    {
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000, // ms
      retries: 120
    }
  );
}

const retry = require('./async_retry');

export async function asyncRetry(authenticatedAxiosClient, url) {
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

export async function asyncRetry(authenticatedAxiosClient, url) {
  const retry = require('async-retry');
  return await retry(async bail => {
    const res = await authenticatedAxiosClient.get(url);
    if (!(res.data && res.data.receipt)) {
      throw new Error('Tx not mined yet');
    }

    if (res.data.receipt.status === 0) {
      bail(new Error(`Tx with hash ${res.data.hash} was reverted`));
      return;
    }

    return res.data.receipt;
  });
}

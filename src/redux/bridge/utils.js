const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollForEvents(contract, eventName, filter={}, fromBlock) {
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

async function waitForEvent ({contract, event, filter, fromBlock, timeoutMs=60e3}) {
  const res = await Promise.race([
    pollForEvents(contract, event, filter, fromBlock),
    timeout(timeoutMs)
  ]);
  if (!res) {
    throw new Error("event polling timeout");
  }
  return res[res.length -1];
}

async function catchSignaturesUntilGrant(bridge, fromBlock, _transactionHash) {
  const filter = { _transactionHash };

  await waitForEvent({
    contract: bridge,
    event: "WithdrawRequestGranted",
    fromBlock,
    filter
  });

  // Collect signatures
  const signatures = new Map();
  const events = await pollForEvents(bridge, "WithdrawRequestSigned", filter, fromBlock);
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
  })

  if (v.length < 1) {
    throw new Error("Withdraw was granted but no signatures were found");
  }

  return {v, r, s, withdrawBlock};
}

async function getBalance(token, address, from=address) {
  const val = await token.methods.balanceOf(address).call({ from }) 
  return parseInt(val);
}

module.exports = { getBalance, catchSignaturesUntilGrant, waitForEvent, pollForEvents, timeout };
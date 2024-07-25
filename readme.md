<div align="center">
<h1><strong> Token Snapshot </strong></h1>
<h2>Create ERC1155 Token Snapshots on any EVM chains!</h2>

<br></br>

</div>

This command-line utility creates a snapshot of any ERC1155 token in JSON or CSV format. Use your own fully synced Ethereum node or any _Ethereum node as a service_ like Infura.

- Works without a local Ethereum node.
- Automatically resumes the next time upon failure.
- Tested to work with Infura / QuickNode / Alchemy.

## Getting Started

```shell
npm install token-snapshot -g
```

### CLI Arguments

None. Prompts for user input and produces a configuration file on the first run.

### How to Use Token Snapshot?

Navigate to a directory where you'd like to save the token snapshot to.

```shell
cd path/to/a/directory
```

Run the program:

```shell
snapshot
```

## Configuration File / Prompt Parameters

```json
{
  "provider": "https://mainnet.infura.io/v3/<key>",
  "contractAddress": "",
  "fromBlock": 0,
  "toBlock": "latest",
  "ids": [6, 9],
  "format": "json",
  "blocksPerBatch": 2500,
  "delay": 0,
  "checkIfContract": "yes"
}
```

### provider

Enter your fully synced Ethereum node. Could be a local node or remote services like Infura.

### contractAddress

Address of your ERC20 token.

### fromBlock

The block height to scan from. To save time, enter the block number of the transaction your token was created on.

### toBlock

The block height to end the scan at.

### ids

Array of token ids to include in the snapshot

### format

The format of the output file(s), either `CSV` or `JSON`. `both` is selected by default.

### blocksPerBatch

The number of blocks to query per batch.

If you are using remote service like Infura, keep this number relative low (2000-5000) to avoid rate limits. If you are using a dedicated Ethereum node, you can increase this number to suit your needs.

### delay

The delay (in ms) between each request in the loop. Tweak this if you are experiencing rate limit from your provider.

### checkIfContract

Checks each address to determine whether it is a smart contract or an Ethereum wallet.

## Result

You will get your snapshot files in the newly created `result/balances` folder. You can also check the detail of each block in which a tx was found in `result/tx/{token Symbol}`

## Aknowlegements

> [@Pedrojok01](https://github.com/Pedrojok01):<br> > https://github.com/Pedrojok01/token-snapshot/tree/main

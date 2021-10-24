# Example ARWeave Uploader using `arweave-streams-tx`

An example of uploading large files on ARWeave with `arweave-js` and Node v15+. Uses `arweave-streams-tx` to stream files and get around 2GB NodeJS limit.

### Install deps

1. `yarn install`

### Running on local ARWeave node

1. make sure you have `arweave` running locally, easiest way is just run `npm arlocal` in separate Terminal
2. `yarn upload`

### Running on live ARWeave network

1. Run `WALLET_PATH=full_path_to_your_arwallet.json yarn upload`, make sure the path is a full path e.g. `/Users/abc/wallet_abc.json`

### Environment vars to play around with different options

* To run with standard `while (!uploader.isComplete) await uploader.uploadChunk()`, set env var `UPLOAD_PROGRESS` e.g. `UPLOAD_PROGRESS=yes yarn upload`
* To customise the file uploaded set `FILE_PATH` e.g. `FILE_PATH=/Users/abc/big.mp4 yarn upload`
* To set path to wallet `WALLET_PATH=full_path_to_your_arwallet.json` e.g. `WALLET_PATH=full_path_to_your_arwallet.json yarn upload`
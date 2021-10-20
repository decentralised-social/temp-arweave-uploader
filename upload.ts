import { createTransactionAsync, uploadTransactionAsync } from 'arweave-stream-tx'
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'

const opener = require('opener')
const Arweave = require('arweave')

const { FILE_PATH, WALLET_PATH, UPLOAD_PROGRESS } = process.env

const baseUrl = WALLET_PATH ? 'https://arweave.net/' : 'http://localhost:1984/'
const arweave = new Arweave(WALLET_PATH ? {
  host: 'arweave.net',
  protocol: 'https',
  port: 443,
  logging: true,
  timeout: 3000000,
  logger: console.log,
} : {
  host: '127.0.0.1',
  port: 1984,
  protocol: 'http',
  logging: true,
  logger: console.log,
})

const openUpload = (txId: string) => {
  console.log(`Opening upload for transaction ID: ${txId}`)
  opener(`${baseUrl}${txId}`)
}

const main = async () => {
  const wallet = WALLET_PATH ? require(WALLET_PATH) : await arweave.wallets.generate()
  const address = await arweave.wallets.jwkToAddress(wallet)
  const balance = await arweave.wallets.getBalance(address)
  const balanceAr = await arweave.ar.winstonToAr(balance)
  console.log(`Balance of ${address} is AR${balanceAr}`)

  const filePath = FILE_PATH || './example.mp4'

  let start = Date.now()
  console.log('createTransactionAsync...')
  const tx = await pipeline(createReadStream(filePath), createTransactionAsync({}, arweave, wallet))
  console.log(`createTransactionAsync took ${Date.now() - start}ms`)
  tx.addTag('Content-Type', 'video/mp4')

  const fee = await arweave.ar.winstonToAr(tx.reward)
  console.log(`fee is ${fee}`)

  console.log('arweave.transactions.sign')
  start = Date.now()
  await arweave.transactions.sign(tx, wallet)
  console.log(`arweave.transactions.sign took ${Date.now() - start}ms`)

  if (UPLOAD_PROGRESS) {
    console.log('Upload with standard while loop...')
    try {
      start = Date.now()
      const uploader = await arweave.transactions.getUploader(tx)
      
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`)
      }
      console.log(`uploader.uploadChunk calls took ${Date.now() - start}ms`)
      openUpload(tx.id)
    } catch (e) {
      console.error('while (!uploader.isComplete) uploader.uploadChunk() failed', e)
    }
  } else {
    console.log('Upload with uploadTransactionAsync from arweave-streams-tx...')
    try {
      start = Date.now()
      await pipeline(createReadStream(filePath), uploadTransactionAsync(tx, arweave, false))
      console.log(`uploadTransactionAsync took ${Date.now() - start}ms`)
      openUpload(tx.id)
    } catch (e) {
      console.error('uploadTransactionAsync failed', e)
    }
  }
}

main().then(() => process.exit(0))
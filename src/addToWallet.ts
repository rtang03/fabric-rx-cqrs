require('dotenv').config();

import { FileSystemWallet, X509WalletMixin } from 'fabric-network';
import fs from 'fs';
import path from 'path';

export async function addToWallet() {
  if (!process.env.WALLET_ROOT)
    throw new Error('No root path to wallet');

  if (!process.env.WALLET)
    throw new Error('No relative path to wallet');

  if (!process.env.PRIVATE_KEY)
    throw new Error('No private key name');

  if (!process.env.KEY_PATH)
    throw new Error('No path to private key');

  if (!process.env.IDENTITY)
    throw new Error('No Identiy Name');

  if (!process.env.MSPID)
    throw new Error('No MSP Org');

  const wallet = new FileSystemWallet(path.join(process.env.WALLET_ROOT, process.env.WALLET));
  const cert = fs.readFileSync(process.env.CERT_PATH).toString();
  const key = fs
    .readFileSync(path.join(process.env.KEY_PATH, process.env.PRIVATE_KEY))
    .toString();
  const identity = X509WalletMixin.createIdentity(process.env.MSPID, cert, key);
  await wallet.import(process.env.IDENTITY, identity);
}

addToWallet().catch(error => {
  console.log(error);
  console.log(error.stack);
  process.exit(-1);
});

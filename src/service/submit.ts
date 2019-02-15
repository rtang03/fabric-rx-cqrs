require('dotenv').config();

import { FileSystemWallet, Gateway } from 'fabric-network';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { Entity } from '../types';

export async function submit(
  fcn: string,
  args: string[]
): Promise<Record<string, Entity> | { error: any }> {
  const gateway = await new Gateway();
  try {
    const identity = process.env.IDENTITY;
    if (!identity) {
      const error = new Error('No application identity');
      console.error(error);
      return { error };
    }

    const profile = process.env.CONNECTION_PROFILE_PATH;
    if (!profile) {
      const error = new Error('No connection profile');
      console.error(error);
      return { error };
    }
    const connectionProfile = await yaml.safeLoad(
      fs.readFileSync(profile, 'utf8')
    );

    const wallet = await new FileSystemWallet(
      path.join(process.env.WALLET_ROOT, process.env.WALLET)
    );

    const connectionOptions = {
      identity,
      wallet,
      discovery: { enabled: false, asLocalhost: true }
    };

    await gateway.connect(
      connectionProfile,
      connectionOptions
    );
    const network = await gateway.getNetwork('mychannel');
    const contract = await network.getContract(
      'eventstore',
      'org.example.eventstore'
    );
    console.log('Submit transaction.');
    let res: any;
    if (fcn.startsWith('query')) {
      res = await contract.evaluateTransaction(fcn, ...args);
    } else {
      res = await contract.submitTransaction(fcn, ...args);
    }
    console.log('Process transaction response.');
    return JSON.parse(Buffer.from(JSON.parse(res)).toString()) as Record<
      string,
      Entity
    >;
  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.error(error.stack);
    return { error };
  } finally {
    console.log('Disconnect from Fabric gateway.');
    gateway.disconnect();
  }
}

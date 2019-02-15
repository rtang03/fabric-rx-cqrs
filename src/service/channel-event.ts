require('dotenv').config();

import { ChannelEventHub } from 'fabric-client';
import { FileSystemWallet, Gateway } from 'fabric-network';
import fs from 'fs';
import { inject, injectable } from 'inversify';
import yaml from 'js-yaml';
import path from 'path';
import * as EntityQ from '../cqrs/entity-query';
import {
  IChannelEvent,
  IStore,
  Logger,
  TYPES
} from '../rx-store';
import { Entity } from '../types';

@injectable()
export class ChannelEvent implements IChannelEvent {
  hub: ChannelEventHub;
  registerId;
  gateway: Gateway;

  constructor(
    @inject(TYPES.Store) public store: IStore,
    @inject(TYPES.Logger) public logger: Logger,
  ) {}

  async invoke() {
    this.gateway = await new Gateway();
    const hub: ChannelEventHub = await getHub(this.gateway);
    if (!hub) throw new Error('⁉️ No Channel Event Hub');
    console.log('💢 Channel Event Hub Exists');

    await hub.connect(true);
    this.hub = hub;
    console.info('Channel Event Hub Connected');
    this.registerId = await hub.registerChaincodeEvent(
      'eventstore',
      'createEntity',
      ({ tx_id, payload }) => {
        console.log(`🚕 Channel event arrived: ${tx_id}`);
        const channelEvent = payload.toString('utf8');
        const entity: Entity = JSON.parse(channelEvent);
        entity.version = parseInt(entity.version as any, 10);

        // write to entity-query
        this.store.dispatch(
          new EntityQ.MergeAction({
            tx_id: entity.commitId,
            args: { entityName: entity.entityName, entity }
          })
        );
      }
    );
  }

  async close() {
    this.hub.unregisterChaincodeEvent(this.registerId, true);
    this.gateway.disconnect();
  }
}

async function getHub(gateway: Gateway): Promise<any> {
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
      // fs.readFileSync(path.join(__dirname, '../../../gateway', profile), 'utf8')
      fs.readFileSync( profile, 'utf8')
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
    const network = await gateway.getNetwork( process.env.CHANNEL_NAME || 'mychannel');

    const channelHub = process.env.CHANNEL_HUB;
    if (!channelHub) {
      const error = new Error('No channel hub');
      console.error(error);
      return { error };
    }
    return network.getChannel().getChannelEventHub(channelHub);
  } catch (error) {
    console.log(`Error get channel hub. ${error}`);
    console.error(error.stack);
    return { error };
  }
}

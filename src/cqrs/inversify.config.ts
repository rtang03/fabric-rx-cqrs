require('events').EventEmitter.defaultMaxListeners = 15;

import { PubSub } from 'graphql-subscriptions';
import { Container } from 'inversify';
import 'reflect-metadata';
import {
  IChannelEvent,
  IEffect,
  IFabricService,
  IStore,
  provideStore,
  TYPES
} from '../rx-store';
import { ChannelEvent, FabricService } from '../service';
import * as Entity from './entity';
import * as EntityC from './entity-command';
import * as EntityQ from './entity-query';
import * as Projection from './projection';

export interface AppSchema {
  [Entity.REDUCER]: Entity.State;
  [EntityC.REDUCER]: EntityC.State;
  [EntityQ.REDUCER]: EntityQ.State;
  [Projection.REDUCER]: Projection.State;
}

export const INITIAL_STATE = {
  [Entity.REDUCER]: Entity.initialState,
  [EntityC.REDUCER]: EntityC.initialState,
  [EntityQ.REDUCER]: EntityQ.initialState,
  [Projection.REDUCER]: Projection.initialState
};

export const INITIAL_REDUCER = {
  [Entity.REDUCER]: Entity.reducer,
  [EntityC.REDUCER]: EntityC.reducer,
  [EntityQ.REDUCER]: EntityQ.reducer,
  [Projection.REDUCER]: Projection.reducer
};

const container: Container = provideStore<AppSchema>(
  INITIAL_STATE,
  INITIAL_REDUCER
);

container.bind<IEffect>(TYPES.EntityEffect).to(Entity.Effect);
container.bind<IEffect>(TYPES.EntityCEffect).to(EntityC.Effect);
container.bind<IEffect>(TYPES.EntityQEffect).to(EntityQ.Effect);
container.bind<IFabricService>(TYPES.FabricService).to(FabricService);
container.bind<IChannelEvent>(TYPES.ChannelEvent).to(ChannelEvent);
container.bind<PubSub>('PubSub').toConstantValue(new PubSub());
container.get<IEffect>(TYPES.EntityEffect).invokeEffect();
container.get<IEffect>(TYPES.EntityCEffect).invokeEffect();
container.get<IEffect>(TYPES.EntityQEffect).invokeEffect();
const pubSub = container.get<PubSub>('PubSub');
const channelEvent = container.get<IChannelEvent>(TYPES.ChannelEvent);
const store = container.get<IStore<AppSchema>>(TYPES.Store);

export { channelEvent, store, container, pubSub };

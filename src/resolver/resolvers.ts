import { capitalize, intersection, map } from 'lodash';
import {
  Arg,
  ClassType,
  Ctx,
  Query,
  Resolver,
  Root,
  Subscription
} from 'type-graphql';
import { Entity } from '../types';

const isEventArrived = (
  eventSubscribed: string[],
  eventsArrived: any[]
): boolean =>
  !!intersection(map(eventsArrived, 'type'), eventSubscribed).length;

export const getSubscriptionResolver: (entName: string) => any = (
  entName: string
) => {
  @Resolver()
  class AbstractResolver {
    @Subscription(() => Entity, {
      name: `to${capitalize(entName)}`,
      topics: 'ENTITY',
      filter: ({ payload, args }) =>
        args.entityName === entName &&
        isEventArrived(args.event, payload.events) &&
        args.id === payload.id
    })
    toEntity(
      @Root() entity: Entity,
      @Arg('entityName') entityName: string,
      @Arg('event', () => [String]) event: string[],
      @Arg('id') id: string
    ): Entity {
      return entity;
    }

    @Subscription(() => Entity, {
      name: `to${capitalize(entName)}s`,
      topics: 'ENTITY',
      filter: ({ payload, args }) =>
        args.entityName === entName &&
        isEventArrived(args.event, payload.events)
    })
    toEntities(
      @Root() entity: Entity,
      @Arg('entityName') entityName: string,
      @Arg('event', () => [String]) event: string[]
    ) {
      return entity;
    }
  }
  return AbstractResolver;
};

export const getQueryResolver: <T extends ClassType>(
  suffix: string,
  returnType: T
) => any = <T extends ClassType>(suffix: string, returnType: T) => {
  @Resolver()
  class AbstractResolver {
    @Query(() => returnType, { name: `get${capitalize(suffix)}` })
    async query(
      @Arg('id', () => String) id: string,
      @Ctx() { repo }
    ): Promise<T> {
      return repo.getById(id).then(({ currentState }) => currentState);
    }

    @Query(() => [returnType], { name: `getAll${capitalize(suffix)}` })
    async queryAll(@Ctx() { repo }): Promise<T[]> {
      return repo.getByEntityName().then(({ entities }) => entities);
    }

    @Query(() => [Entity], { name: `${suffix}Commits` })
    async getCommits(
      @Arg('id', () => String) id: string,
      @Ctx() { repo }
    ): Promise<Entity[]> {
      return repo.getCommitById(id).then(({ entities }) => entities || []);
    }
  }
  return AbstractResolver;
};
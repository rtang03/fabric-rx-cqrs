// import { GraphQLJSON } from 'graphql-type-json';
import { assign } from 'lodash';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Base Event' })
export class LocalBaseEvent {
  @Field({ nullable: true })
  readonly type?: string;

  // @Field(() => GraphQLJSON, { nullable: true })
  payload?: any;
}

@ObjectType({ description: 'Commit' })
export class LocalEntity<T extends LocalBaseEvent = any> {
  @Field(() => String, { nullable: true })
  id: string;

  @Field(() => String, { nullable: true })
  entityName: string;

  @Field(() => Int, { nullable: true })
  version: number;

  @Field(() => String, { nullable: true })
  commitId: string;

  @Field(() => String, { nullable: true })
  committedAt: string;

  @Field(() => String, { nullable: true })
  entityId: string;

  @Field(() => [LocalBaseEvent], { nullable: true })
  events: LocalBaseEvent[];
}

export function createLocalEntity<T extends LocalBaseEvent = any>({
  id,
  entityName,
  version,
  events
}: {
  id: string;
  entityName: string;
  version: number;
  events: T[];
}): LocalEntity<T> {
  const now = Date.now();
  const date = new Date(now).toISOString().replace(/[^0-9]/g, '');
  const commitId = `${date}:${id}`;
  const committedAt = now.toString();
  return assign(
    {},
    {
      id,
      entityName,
      commitId,
      committedAt,
      version,
      events,
      entityId: id
    }
  );
}

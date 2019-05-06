[![CircleCI](https://circleci.com/gh/rtang03/fabric-rx-cqrs.svg?style=svg)](https://circleci.com/gh/rtang03/fabric-rx-cqrs)
### About

**Hyperledge Fabric: make _Reactive_ and _CQRS-ES_**  
A powerful and light-weight library, to empower middle-tier application of Hyperledger,
to break through the barriers of Deeply Decentralized application.

### Motivation

Why this project is created? And what problem does it solve? And how?

See [Motivation] under development

### Philosophy

- Simplicity. This is intentionally a library, instead of framework
- Model-free
- Deterministic
- Strong Decoupling
- Highly reactive

### Key Concepts

- Reactive Pattern ([Reactivity](https://www.reactivemanifesto.org/))
- Command Query Responsibility Segregation ([CQRS](https://martinfowler.com/bliki/CQRS.html))
- Event Sourcing ([ES](https://martinfowler.com/eaaDev/EventSourcing.html))
- Redux-like architecture ([Redux](https://redux.js.org/basics/data-flow))
- End-to-end Type Coverage ([Type-system](https://js.foundation/blog/2018/10/09/graphql-grpc-end-to-end-type-coverage))

Command-side is Fabric; query-side is in-memory database. 

See [How we may achieve deep decentralization] under development

### Prerequisite

- Hyperledger Fabric V1.4; its prerequisite remains
- Install Fabric-samples

### Configuration

| Env Variables           | Values                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CERT_PATH               | e.g. ~/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem |
| CHANNEL_HUB             | peer name to be listened, e.g. peer0.org1.example.com                                                                                                           |
| CHANNEL_NAME            | e.g. mychannel                                                                                                                                                  |
| CONNECTION_PROFILE_PATH | path to connection profile e.g. ~/connection.yaml                                                                                                               |
| IDENTITY                | registered user name in Fabric, e.g. User1@example.com                                                                                                          |
| KEY_PATH                | e.g. fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/                                   |
| MSPID                   | e.g. Org1MSP                                                                                                                                                    |
| PRIVATE_KEY             | filename of private key under KEY_PATH                                                                                                                          |
| WALLET                  | Directory name of local wallet                                                                                                                                  |
| WALLET_ROOT             | absolute path of wallet                                                                                                                                         |

Note that all paths are absolute paths. And, all configurations are required.

### The Basics

**Step 1: Install Fabric, and fabric-samples**

**Step 2: Bootstrap the basic-network**  
Remember to run fabcar example, to validate the installation.

**Step 3: get boilerplated application & set env variables**  
More examples will added, in Examples.

See Hyperledger [documentation](https://hyperledger-fabric.readthedocs.io/en/release-1.4/) from step 1 to 2.  
see [Examples](https://github.com/rtang03/examples), from step 3.

**Step 4: make default reducer for each peer application**

Based on counter example:

```
// counter-reducer.ts

import { BaseEvent, Reducer } from 'fabric-rx-cqrs';

export interface CounterEvent extends BaseEvent {
  type: 'ADD' | 'MINUS';
}

export interface Counter {
  id: string;
  value: number;
}

export const counterReducer: Reducer<Counter> = (
  history: CounterEvent[],
  initial = { value: 0 }
): Counter => history.reduce(reducer, initial);

const reducer = ({ value }, e: CounterEvent) => {
  switch (e.type) {
    case 'ADD':
      value++;
      return { value };
    case 'MINUS':
      value--;
      return { value };
    default:
      return { value };
  }
};
```

Each peer application requires at least one reducer function,
to compute the current state, from history of events.

`type Reducer<T> = (history: { type: string; payload?: any }[], initial?: T) => T;` 
 
Similarly, one, or more events are required. Payload will be used to compute the currents state.   
`type BaseEvent = { type: string, payload: any}`

Each entity must be given an unique identitier `id`, as entity Id. 

**Step 5: set the defaultReducer**

```
// counter.spec.ts
import { Entity, setDefaultReducer, getRepository, channelEvent, container } from 'fabric-rx-cqrs';
import { Counter, CounterEvent, counterReducer } from './counter-reducer';

setDefaultReducer(container, 'counter', counterReducer);
```

Each peer application have only a single default reducer. 
The `getProjection` function depends on default reducer.  
 
`setDefaultReducer(container: Container, entityName:string, reducer: Reducer)`

**Step 6: listen to channel event hub**

```
// counter.spec.ts
await channelEvent.invoke();
```
This invokes the channel event hub. Whenever new commits, it publishes to in-memory query-side database.  

**Step 7: get repository**

```
// counter.spec.ts
const entityName = 'counter';
const id = 'counter_test' + Math.floor(Math.random() * 1000);

const counterRepository = getRepository<Counter, CounterEvent>(
  'counter',
  counterReducer
);
```

**getRepository** is the most commonly used function, which returns typed Repository;
K being the type argument for typed BaseEvent.  

`getRepository<T, K>(entityName: string, reducer: () => void): Repository`

Repository is function factory, which returns: 
```
type Repository<T, K> = {
  create: Function; // create entity
  getById: Function; // return current state and save(), by entity id
  getByEntityName: Function; // return array of (currentState) entities by, entity name
  getCommitById: Function; // return commits by entity id
  getProjection: Function; // return array of entities, by projection criteria
}
```
Note that argument `reducer` of `getRepository` can be the same or different reducer from `defaultReducer`;
referred as non-default reducer. `getById`, `getByEntityName` are computed 
based on non-default reducer. `getProjection` is based on default reducer.  

**Step 8: write event to Fabric repository**

```
// counter.spec.ts
await counterRepository.create(id).save([{ type: 'ADD' }])
```

This writes to Fabric, returning type Entity; is a commit object. If write failure, 
it return `null` commit, and throw error.  

```
type Repository<T, K> = {
  create: (id: string) => { save: (events: K[]) => Promise<Entity> }
}
```  

Every successful write will return commit object.

```
type Entity = {
  id: string;
  commitId: string;
  version: number;
  events;
  entityId: string;
  committeAt: string;
}
```


**Step 9: get current state by projection**
```
// counter.spec.ts
counterRepository
  .getProjection({ where: { id } })
  .then(({ projections }) => {
    expect(projections).to.deep.equal([{ id, value: 2 }]);
  });
```  

`getProjection` is similar to a search function, but implemented with selector. 
The computation is based on defaultReducer. Currently,
there are three operator: `where`, `all`, `contain`.  

```
type Repository<T, K> = {
  getProjection: ({ where, all, contain }: 
    { where?: Partial<T>; all?: boolean; contain?: string }
  ) => Promise<{ projections: T[] }>;
}
```  
  
**Reconcile**  
Lastly, `reconcile()` performs reconcilation from write-side Fabric, to in-memory database; 
is the key bootstraping procedure for each peer application.  

`const reconcile = async (entityName: string, reducer: () => void) => Promise<any>`

In each peer application, it can run multiple reconcile, for different `entityName`. e.g.  

```
reconcile('counterA', counterReducer);
reconcile('counterB', counterReducer);
```

### GraphQL Support

It provides `getQueryResolver`, `getSubscriptionResolver`, which return high-order resolvers for GraphQL server. 
This is very convenient feature to generate CRUD resolvers, via decorated domain model.
Thanks to [Type-GraphQL](https://19majkel94.github.io/type-graphql/). 

It will generate executable resolver, for below example query. 
```
getCounter(id: "counterId") {
  id
  value
}

getAllCounter {
  id 
  value
}

getCommits(id: "counterId") {
  id
  commitId
  version
  events
  entityId
  committeAt
}
```

It leverages `pubSub()`, as default publish-subscription engine, for GraphQL subscription. 

GraphQL is the preferred API implementation; beyond the scope of this library.  

GraphQL test-net is under development.  
  
### Technologies

- GraphQL
- Hyperledger Fabric
- Inversify
- Redux
- Rxjs
- Typescript

### Getting Started: Basic Examples

See [Basic Examples](https://github.com/rtang03/examples)

### Fullstack Example

Fullstack example is innovative pattern of Deeply Decentralized application.
It is built on top of byfn-network, with 4 x peers & 2 x ca, featured with

- Example business application, with 4 x distributed api endpoint, built by [Apollo GraphQL Server](https://www.apollographql.com/), with schema-stitching enabled
- Business scenario, modelling with [DDD](https://en.wikipedia.org/wiki/Domain-driven_design); 3 x [Aggregates](https://martinfowler.com/bliki/DDD_Aggregate.html), running on 3 different peer apps.
- The fourth peer app manages the customer PII, so as to fulfill GDPR.
- Designed with [Onion Architecture](https://www.codeguru.com/csharp/csharp/cs_misc/designtechniques/understanding-onion-architecture.html)
- Frontend: Material-design Reactjs with stateless functional components only, and HOC
- Frontend: Redux-free local state management, with Apollo client
- One language: Web-ui, middle-tier app, chaincode, and tests are written in Typescript
- E2E type system [E2E Typing](https://www.youtube.com/watch?v=S93i9wuZRhA&t=4s)
- E2E stateless functional programming
- Runtime breaking change detection
- Behavior-driven development [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development) Tests
- Monorepo in yarn, for four peer applications, and one React app
- Dockerization
- Follow 12-Factor app methodology

Fullstack code example is under development, will be provided later.

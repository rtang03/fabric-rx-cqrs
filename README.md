## About

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

Command-side is Fabric; query-side is in-memory database. Whenever a write is made, all peer nodes receive
channel event notifications.

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

**Step 3: get boilerplated application & set env variables**

see README of [Examples](https://github.com/rtang03/examples), from step 1 to 3

**Step 4: make default reducer for each peer application**

```
// counter-reducer.ts

import { BaseEvent, Reducer } from 'fabric-rx-cqrs';

export interface CounterEvent extends BaseEvent {
  type: string;
}

export interface Counter {
  id?: string;
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

Also, you may declare a number of event type,

**Step 5: set the defaultReducer**

```
// index.ts
import { Entity, setDefaultReducer, getRepository, channelEvent, container } from 'fabric-rx-cqrs';
import { Counter, CounterEvent, counterReducer } from './counter-reducer';

setDefaultReducer(container, 'counter', counterReducer);
```

The _defaultReducer_ alllows to compute the current state from list of committed events.

**Step 6: listen to channel event hub**

```
// index.ts
await channelEvent.invoke();
```

**Step 7: get repository**

```
const entityName = 'counter';
const id = 'counter_test' + Math.floor(Math.random() * 1000);

const counterRepository = getRepository<Counter, CounterEvent>(
  'counter',
  counterReducer
);
```

**Step 8: write event to repository**

```
// index.ts
counterRepository
  .create(id)
  .save([{ type: 'ADD' }])
  .then(() => done());
```

**Step 9: get computed current state**

```
counterRepository
  .getProjection({ where: { id } })
  .then(({ projections }) => {
    expect(projections).to.deep.equal([{ id, value: 2 }]);
    done();
  });
```

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

- Business application, with 4 x distributed api endpoint, built by [Apollo GraphQL Server](https://www.apollographql.com/), with schema-stitching enabled
- Business scenario, modelling with [Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
- Combined domain model and api schema
- Designed with [Onion Architecture](https://www.codeguru.com/csharp/csharp/cs_misc/designtechniques/understanding-onion-architecture.html)
- Frontend: Reactjs with stateless functional components only, and HOC
- Frontend: Redux-free local state management
- One language: Web-ui, middle-tier chaincode, and tests are written in Typescript
- E2E type system [E2E Typing](https://www.youtube.com/watch?v=S93i9wuZRhA&t=4s)
- E2E stateless functional programming
- Runtime breaking change detection
- Behavior-driven development [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development) Tests
- Monorepo in yarn
- Follow 12-Factor app methodology

Fullstack code example is only available for those signing corporate NDA.

### Support

This is an incubator project. No support is offered.

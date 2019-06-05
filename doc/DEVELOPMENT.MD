## Pre-requisite
- Yarn V1.16+
- Typescript V3.4+
- NodeJS V8.10, as required by Fabric SDK
- Hyperledger Fabric V1.4.1 and its pre-requisite.

## Preparing the development environment
**Step 0**: Make sure First-Network is running.

**Step 1**: Create .env with `touch .env`.  
```text
CERT_PATH=PATH_TO_fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem
CHANNEL_HUB=peer0.org1.example.com
CHANNEL_NAME=mychannel
CONNECTION_PROFILE_PATH=PATH_TO_fabric-rx-cqrs/gateway/core.connection.yaml
IDENTITY=User1@org1.example.com
KEY_PATH=PATH_TO_fabric-samples/first-network/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/
MSPID=Org1MSP
PRIVATE_KEY=81c4754c7f2e8eec36e7cd1a972e3c8f4ade6d4f3b7444af5f07768f4cbff24d_sk
WALLET=identity/wallet
WALLET_ROOT=/PATH_TO_fabric-rx-cqrs
```

**Step 2**: Add to Wallet  
Modify the connection profile `gateway/core.connection.yaml`. 
```yaml
    tlsCACerts:
      path: PATH_TO_fabric-samples/first-network/crypto-config/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
```
  
Run the `addToWallet` script
```sh 
npm run addToWallet
```


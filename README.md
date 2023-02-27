# Fantombnb
Fantom blockchain version of the famous Airbnb application


## Setting Up on Hardhat
### 1. Clone/Download the Repository

Move to folder where you want the repo to be created:

`$ git clone https://github.com/luigicallero/Fantombnb.git`

### 2. Install Dependencies:
`$ npm install`

### 3. Run tests
`$ npx hardhat test`

### 4. Start Hardhat node
`$ npx hardhat node`

### 5. Run deployment script
In a separate terminal execute:
`$ npx hardhat run ./scripts/deploy.js --network localhost`

### 6. Configure Metamask for Hardhat
You need to both configure Hardhat network and import Hardhat accounts to Metamask.

Here is a couple of links explaining how:

[Chainstack documentation](https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node)

[Medium note](https://medium.com/@kaishinaw/connecting-metamask-with-a-local-hardhat-network-7d8cea604dc6#:~:text=Chain%20ID%3A%2031337%20%E2%80%94%20This%20is,that%20is%20implemented%20by%20Hardhat.)

### 7. Start frontend
`$ npm run start`

---
## Settings for another Blockchains
If running this Dapp against other blockchains, you will need to modify the following files

### 1. Add the appropiate blockchain information on the hardhat config file (hardhat.config.js)

Before
```
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
  }
};

```
After
```
require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    fantom_mainnet: {
      url: `https://rpcapi.fantom.network`,
      chainId: 250,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    fantom_testnet: {
      //url: `https://rpc.testnet.fantom.network`,
      url: `https://rpcapi-tracing.testnet.fantom.network`,
      chainId: 4002,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

```
Library dontenv is used to import private information from a hidden file named ".env"  (use .env_sample as template)

Blockchain information should be provided by  Blockchain documentation, for Fantom you can find it here:
    
    https://github.com/Fantom-foundation/example-deployment

### 2. Execute the deployment script pointing to new blockchain

```
npx hardhat run ./scripts/deploy.js --network BLOCKCHAIN
```
And copy the contracts addresses

### 3. Copy Contracts json files to be used by frontend

Copy contracts json files generated during deployment in step 2 from 

    ./artifacts/contracts/FantomBNB.sol/FantomBNB.json
    ./artifacts/contracts/Escrow.sol/Escrow.json

to 

    ./src/abis/

### 4. Update Contracts addresses to be used by frontend

Update file ./src/config.json with corresponding network ID and with contract addresses copied in step 2 

```
{
    "31337": {
        "fantomBNB": {
            "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        },
        "escrow": {
            "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        }
    }
}
```

---
## Useful tools for testing
### Fake Location Generator

https://fakerjs.dev/api/address.html#city

## Useful links:

* Dapp University Real State with NFTs: 
https://www.youtube.com/watch?v=cGQHXmCS94M&t=8657s
* Bumpkins Contract (role based, royalty, etc): https://polygonscan.com/token/0x624e4fa6980afcf8ea27bfe08e2fb5979b64df1c?a=28682#code#L189
* Wiki Documentation used as sample: https://sunflower-land.com/?utm_source=DappRadar&utm_medium=deeplink&utm_campaign=visit-website


## To Dos:
* Juan: Update Houses with correct prices from Rent Contract
* Juan: Search filter to work with NFT
* Esteban: Generate metadata for our NFTs (remove purchase price, we will manage this from rent contract)
* Esteban: Dapp Wiki Web: Dapp link (when hosted in server) and Github Repo Link
* Luis: Message: "connect your metamask to fantom blockchain to display properties information"
* Luis: replace all mappings with a struct
* Luis: This contract could mint new NFTs
* Luis: Missing events (logged in blockchain?)
* Luis: Investigate this repo:https://github.com/kaymen99/DecentralAirbnb
* Luis: function to Update House price (deposit and price)

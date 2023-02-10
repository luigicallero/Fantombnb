# Fantombnb
Fantom blockchain version of the famous Airbnb application


## Setting Up
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

### 6. Start frontend
`$ npm run start`

---
> ### Other Blockchains
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
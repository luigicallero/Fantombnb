require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0000000000000000000000000000000000000000000000000000000000000000';
const API_KEY = process.env.API_KEY || 'H1Q1MC3KLLLJQJ7VHSE7P6735EG3G4FXXX';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    opera: {
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
  },
  etherscan: {
    apiKey: {
      opera: `${API_KEY}`
    }
  }
};

// To verify contracts: 
//  npx hardhat verify --contract contracts/FantomBNB.sol:FantomBNB --network opera 0x40E88F5fD3c47e391D8F5D5Be3c574f86f05c7D6
//  npx hardhat verify --contract contracts/RentFantomBNB.sol:RentFantomBNB --network opera 0x18D8A0170E7d1C890a7BFa1023677d4307Fe888e --constructor-args scripts/argument.js
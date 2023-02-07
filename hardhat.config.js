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

require("dotenv").config(); // Load environment variables
require("@nomiclabs/hardhat-ethers");
require("hardhat-tracer");


module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_URL, // Your Alchemy Unichain RPC
        // blockNumber: 3000000, // Optional, use a stable block number
      },
    },
    unichain: {
      url: "https://unichain-mainnet.g.alchemy.com/v2/wnClQDiGhXMXD36pz0raNlOi9jEUKSaa",
      chainId: 130,
    },
  },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
const {API_URL, PRIVATE_KEY} = process.env;
const path = require("path");

module.exports = {
  solidity: "0.8.1",
 
  paths: {
   artifacts: 'client/src',
   },
 
  
  defaultNetwork: "hardhat",
  networks: {
     
     ropsten: {
        url: API_URL,
        accounts: [`0x${PRIVATE_KEY}`]
     }
  },
};

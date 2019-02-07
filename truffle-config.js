var HDWalletProvider = require('truffle-hdwallet-provider');

if (process.env.NODE_ENV != 'production') {
  require('dotenv').load()
}
const mnemonic = process.env.TRUFFLE_WALLET_MNEMONIC;
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "5777", // Any network (default: none)
    },
    xdai: {
      provider: function () {
        return new HDWalletProvider(mnemonic, process.env.RPC_ENDPOINT)
      },
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: '0.4.25'  // ex:  "0.4.20". (Default: Truffle's installed solc)
    }
 }
}

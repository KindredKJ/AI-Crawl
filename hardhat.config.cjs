require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');

// Pin the npm-distributed compiler so CI builds do not depend on a mutable download endpoint.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async ({ solcVersion }, _hre, runSuper) => {
  if (solcVersion === '0.8.36') {
    const activeCompiler = require('solc').version();
    if (!activeCompiler.startsWith('0.8.36+')) {
      throw new Error(`solc_version_mismatch:configured_0.8.36:installed_${activeCompiler}`);
    }
    return {
      compilerPath: require.resolve('solc/soljson.js'),
      isSolcJs: true,
      version: solcVersion,
      longVersion: require('solc').version(),
    };
  }
  return runSuper();
});

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

module.exports = {
  solidity: {
    version: '0.8.36',
    settings: { optimizer: { enabled: true, runs: 500 }, viaIR: true },
  },
  networks: {
    // Mumbai is retired. Amoy is Polygon PoS testnet (chain ID 80002).
    amoy: {
      url: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      accounts,
    },
  },
};

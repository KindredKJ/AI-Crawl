const hre = require('hardhat');
const fs = require('node:fs/promises');
const path = require('node:path');

async function exists(filename) {
  try {
    await fs.access(filename);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error('No deployer configured');
  const treasury = process.env.MERK_TREASURY_ADDRESS;
  const owner = process.env.MERK_OWNER_ADDRESS;
  if (!hre.ethers.isAddress(treasury) || !hre.ethers.isAddress(owner)) {
    throw new Error('MERK_TREASURY_ADDRESS and MERK_OWNER_ADDRESS must be valid explicit addresses');
  }
  const network = await hre.ethers.provider.getNetwork();
  if (Number(network.chainId) !== 80_002) {
    throw new Error('This release script is restricted to Polygon Amoy chain 80002');
  }
  const output = path.join('deployments', `${network.chainId}.json`);
  const pending = path.join('deployments', `${network.chainId}.pending.json`);
  const lockFile = path.join('deployments', `${network.chainId}.lock`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  const lock = await fs.open(lockFile, 'wx', 0o600);
  try {
    // Before any external transaction, fail closed if a prior receipt or an
    // unresolved deployment journal exists. Never pay gas and then discover EEXIST.
    if (await exists(output)) throw new Error('Existing deployment receipt; refusing to redeploy');
    if (await exists(pending)) throw new Error('Unresolved deployment journal; reconcile prior transactions before retrying');
    const journal = {
      schemaVersion: 'aicrawl.deployment-journal/v1',
      chainId: Number(network.chainId),
      deployer: deployer.address,
      owner,
      treasury,
      stage: 'RESERVED',
      transactions: {},
      contracts: {},
    };
    const persist = () => fs.writeFile(pending, `${JSON.stringify(journal, null, 2)}\n`, { mode: 0o600 });
    await fs.writeFile(pending, `${JSON.stringify(journal, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    const token = await hre.ethers.deployContract('MerkToken', [owner, treasury]);
    journal.transactions.merkToken = token.deploymentTransaction()?.hash || null;
    journal.stage = 'TOKEN_SUBMITTED';
    await persist();
    await token.waitForDeployment();
    journal.contracts.merkToken = await token.getAddress();
    journal.stage = 'TOKEN_DEPLOYED';
    await persist();
    const dungeon = await hre.ethers.deployContract('MerkDungeon', [owner, journal.contracts.merkToken, treasury]);
    journal.transactions.merkDungeon = dungeon.deploymentTransaction()?.hash || null;
    journal.stage = 'DUNGEON_SUBMITTED';
    await persist();
    await dungeon.waitForDeployment();
    journal.contracts.merkDungeon = await dungeon.getAddress();
    journal.stage = 'DEPLOYED_PENDING_RECONCILIATION';
    await persist();
    const receipt = {
      schemaVersion: 'aicrawl.deployment/v1',
      chainId: Number(network.chainId),
      deployer: deployer.address,
      owner,
      treasury,
      contracts: journal.contracts,
      transactions: journal.transactions,
      createdAt: new Date().toISOString(),
    };
    await fs.writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    await fs.unlink(pending);
    console.log(`On-chain deployment receipt recorded to ${output}; explorer and bytecode verification still required.`);
  } finally {
    await lock.close();
    await fs.rm(lockFile, { force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

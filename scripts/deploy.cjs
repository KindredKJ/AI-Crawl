const hre = require('hardhat');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error('No deployer configured');

  const treasury = process.env.MERK_TREASURY_ADDRESS;
  const owner = process.env.MERK_OWNER_ADDRESS;
  if (!hre.ethers.isAddress(treasury) || !hre.ethers.isAddress(owner)) {
    throw new Error('MERK_TREASURY_ADDRESS and MERK_OWNER_ADDRESS must be valid, explicit addresses');
  }

  const token = await hre.ethers.deployContract('MerkToken', [owner, treasury]);
  await token.waitForDeployment();
  const dungeon = await hre.ethers.deployContract('MerkDungeon', [owner, await token.getAddress(), treasury]);
  await dungeon.waitForDeployment();

  const network = await hre.ethers.provider.getNetwork();
  const receipt = {
    schemaVersion: 'aicrawl.deployment/v1',
    chainId: Number(network.chainId),
    deployer: deployer.address,
    owner,
    treasury,
    contracts: { merkToken: await token.getAddress(), merkDungeon: await dungeon.getAddress() },
    createdAt: new Date().toISOString(),
  };
  const output = path.join('deployments', `${network.chainId}.json`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  console.log(`Deployment receipt written to ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


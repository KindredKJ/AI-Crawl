import assert from 'node:assert/strict';
import test from 'node:test';
import { AMOY_CHAIN_ID, MerkDeployment, validateDeployment } from '../src/economy/merkGateway';

const deployment: MerkDeployment = {
  schemaVersion: 'aicrawl.deployment/v1',
  chainId: AMOY_CHAIN_ID,
  contracts: {
    merkToken: '0x0000000000000000000000000000000000000001',
    merkDungeon: '0x0000000000000000000000000000000000000002',
  },
};

test('accepts a versioned Amoy deployment with valid contract addresses', () => {
  assert.equal(validateDeployment(deployment), true);
});

test('rejects the retired Mumbai chain and malformed addresses', () => {
  assert.equal(validateDeployment({ ...deployment, chainId: 80_001 }), false);
  assert.equal(validateDeployment({
    ...deployment,
    contracts: { ...deployment.contracts, merkDungeon: 'not-an-address' },
  }), false);
});


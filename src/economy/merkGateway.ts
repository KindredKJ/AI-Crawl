import { BrowserProvider, Contract, Eip1193Provider, isAddress } from 'ethers';

export const AMOY_CHAIN_ID = 80_002;

const DUNGEON_ABI = [
  'function floor(uint256 floorId) view returns (uint128 entryFee, bool enabled, string contentUri)',
  'function enterFloor(uint256 floorId, uint256 maximumFee, bytes32 commandId)',
] as const;
const MERK_ALLOWANCE_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
] as const;

export interface MerkDeployment {
  schemaVersion: 'aicrawl.deployment/v1';
  chainId: number;
  contracts: { merkToken: string; merkDungeon: string };
}

export type EntryResult =
  | { status: 'CONFIRMED'; transactionHash: string }
  | { status: 'APPROVAL_REQUIRED'; tokenAddress: string; spender: string; requiredAmount: bigint; currentAllowance: bigint }
  | { status: 'UNAVAILABLE'; reason: 'NO_WALLET' | 'WRONG_NETWORK' | 'INVALID_DEPLOYMENT' | 'FLOOR_DISABLED' | 'TRANSACTION_NOT_CONFIRMED' };

export function validateDeployment(value: unknown): value is MerkDeployment {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const contracts = record.contracts;
  if (typeof contracts !== 'object' || contracts === null || Array.isArray(contracts)) return false;
  const addresses = contracts as Record<string, unknown>;
  return record.schemaVersion === 'aicrawl.deployment/v1'
    && record.chainId === AMOY_CHAIN_ID
    && typeof addresses.merkToken === 'string'
    && typeof addresses.merkDungeon === 'string'
    && isAddress(addresses.merkToken)
    && isAddress(addresses.merkDungeon);
}

/** Wallet transactions are explicit user actions; combat never implies payment. */
export async function enterMerkFloor(
  injected: Eip1193Provider | null,
  deployment: MerkDeployment,
  floorId: bigint,
  commandId: string,
): Promise<EntryResult> {
  if (!injected) return { status: 'UNAVAILABLE', reason: 'NO_WALLET' };
  if (!validateDeployment(deployment)) return { status: 'UNAVAILABLE', reason: 'INVALID_DEPLOYMENT' };

  const provider = new BrowserProvider(injected);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== deployment.chainId) {
    return { status: 'UNAVAILABLE', reason: 'WRONG_NETWORK' };
  }
  const signer = await provider.getSigner();
  const dungeon = new Contract(deployment.contracts.merkDungeon, DUNGEON_ABI, signer);
  const configured = await dungeon.floor(floorId) as [bigint, boolean, string];
  if (!configured[1]) return { status: 'UNAVAILABLE', reason: 'FLOOR_DISABLED' };
  const entryFee = configured[0];
  const dungeonAddress = deployment.contracts.merkDungeon;
  const merk = new Contract(deployment.contracts.merkToken, MERK_ALLOWANCE_ABI, signer);
  const currentAllowance = await merk.allowance(await signer.getAddress(), dungeonAddress) as bigint;
  if (currentAllowance < entryFee) {
    return {
      status: 'APPROVAL_REQUIRED',
      tokenAddress: deployment.contracts.merkToken,
      spender: dungeonAddress,
      requiredAmount: entryFee,
      currentAllowance,
    };
  }
  // Fee is bounded by the wallet's quoted value even if the owner reprices
  // the floor before this signed transaction is included on chain.
  const transaction = await dungeon.enterFloor(floorId, entryFee, commandId);
  const receipt = await transaction.wait();
  if (!receipt || receipt.status !== 1) {
    return { status: 'UNAVAILABLE', reason: 'TRANSACTION_NOT_CONFIRMED' };
  }
  return { status: 'CONFIRMED', transactionHash: receipt.hash };
}


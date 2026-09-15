import * as StellarSdk from '@stellar/stellar-sdk';
import type { StellarNetwork } from '../types/index.js';

const NETWORKS: Record<StellarNetwork, { passphrase: string; rpc: string }> = {
  testnet: {
    passphrase: StellarSdk.Networks.TESTNET,
    rpc: 'https://soroban-testnet.stellar.org',
  },
  mainnet: {
    passphrase: StellarSdk.Networks.PUBLIC,
    rpc: 'https://soroban-mainnet.stellar.org',
  },
  futurenet: {
    passphrase: StellarSdk.Networks.FUTURENET,
    rpc: 'https://soroban-futurenet.stellar.org',
  },
};

export class StellarService {
  private server: StellarSdk.SorobanRpc.Server;
  private passphrase: string;
  private network: StellarNetwork;

  constructor(network: StellarNetwork = 'testnet') {
    this.network = network;
    const config = NETWORKS[network];
    this.server = new StellarSdk.SorobanRpc.Server(config.rpc);
    this.passphrase = config.passphrase;
  }

  getServer(): StellarSdk.SorobanRpc.Server {
    return this.server;
  }

  getNetworkPassphrase(): string {
    return this.passphrase;
  }

  getNetwork(): StellarNetwork {
    return this.network;
  }

  async getAccount(publicKey: string): Promise<StellarSdk.Account> {
    return this.server.getAccount(publicKey);
  }

  async simulateTransaction(
    transaction: StellarSdk.Transaction
  ): Promise<StellarSdk.SorobanRpc.Api.SimulateTransactionResponse> {
    return this.server.simulateTransaction(transaction);
  }

  async prepareTransaction(
    transaction: StellarSdk.Transaction
  ): Promise<StellarSdk.Transaction> {
    return this.server.prepareTransaction(transaction);
  }

  async sendTransaction(
    transaction: StellarSdk.Transaction
  ): Promise<StellarSdk.SorobanRpc.Api.SendTransactionResponse> {
    return this.server.sendTransaction(transaction);
  }

  async getTransaction(
    hash: string
  ): Promise<StellarSdk.SorobanRpc.Api.GetTransactionResponse> {
    return this.server.getTransaction(hash);
  }

  async waitForTransaction(
    hash: string,
    timeout?: number
  ): Promise<StellarSdk.SorobanRpc.Api.GetTransactionResponse> {
    return this.server.waitForTransaction(hash, timeout);
  }

  async getContractData(
    contractId: string,
    key: StellarSdk.xdr.ScVal
  ): Promise<StellarSdk.SorobanRpc.Api.LedgerEntryResult> {
    return this.server.getContractData(contractId, key);
  }
}

let instance: StellarService | null = null;

export function getStellarService(network?: StellarNetwork): StellarService {
  if (!instance || (network && network !== instance.getNetwork())) {
    instance = new StellarService(network || (process.env.STELLAR_NETWORK as StellarNetwork) || 'testnet');
  }
  return instance;
}

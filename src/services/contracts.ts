import * as StellarSdk from '@stellar/stellar-sdk';
import { getStellarService } from './stellar.js';
import type {
  CreateStreamInput,
  CreateInvoiceInput,
  CreatePlanInput,
  SubscribeInput,
  Stream,
  Invoice,
  Subscription,
  SubscriptionPlan,
  StellarNetwork,
} from '../types/index.js';

export class ContractService {
  private stellar: ReturnType<typeof getStellarService>;

  constructor(network?: StellarNetwork) {
    this.stellar = getStellarService(network);
  }

  // Stream Operations
  async createStream(
    input: CreateStreamInput,
    sourceKeypair: StellarSdk.Keypair
  ): Promise<string> {
    const contractId = process.env.STREAM_CONTRACT_ID!;
    const account = await this.stellar.getAccount(sourceKeypair.publicKey());

    const contract = new StellarSdk.Contract(contractId);
    const op = contract.call(
      'create_stream',
      StellarSdk.Address.fromString(input.sender).toScVal(),
      StellarSdk.Address.fromString(input.receiver).toScVal(),
      StellarSdk.nativeToScVal(input.amountPerSecond, { type: 'u128' }),
      StellarSdk.nativeToScVal(input.startTime, { type: 'u64' }),
      StellarSdk.nativeToScVal(input.endTime, { type: 'u64' })
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.stellar.getNetworkPassphrase(),
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    tx.sign(sourceKeypair);
    const result = await this.stellar.sendTransaction(tx);
    return result.hash;
  }

  async getStream(streamId: string): Promise<Stream> {
    const contractId = process.env.STREAM_CONTRACT_ID!;
    const key = StellarSdk.nativeToScVal(streamId, { type: 'u64' });
    const result = await this.stellar.getContractData(contractId, key);
    return StellarSdk.scValToNative(result.xdr) as Stream;
  }

  async withdraw(
    streamId: string,
    amount: string | null,
    sourceKeypair: StellarSdk.Keypair
  ): Promise<string> {
    const contractId = process.env.STREAM_CONTRACT_ID!;
    const account = await this.stellar.getAccount(sourceKeypair.publicKey());

    const contract = new StellarSdk.Contract(contractId);
    const op = contract.call(
      'withdraw',
      StellarSdk.nativeToScVal(streamId, { type: 'u64' }),
      amount
        ? StellarSdk.nativeToScVal(amount, { type: 'u128' })
        : StellarSdk.nativeToScVal(null, { type: 'option' })
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.stellar.getNetworkPassphrase(),
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    tx.sign(sourceKeypair);
    const result = await this.stellar.sendTransaction(tx);
    return result.hash;
  }

  // Invoice Operations
  async createInvoice(
    input: CreateInvoiceInput,
    sourceKeypair: StellarSdk.Keypair
  ): Promise<string> {
    const contractId = process.env.INVOICE_CONTRACT_ID!;
    const account = await this.stellar.getAccount(sourceKeypair.publicKey());

    const items = input.items.map((item) => ({
      description: StellarSdk.nativeToScVal(item.description, { type: 'string' }),
      amount: StellarSdk.nativeToScVal(item.amount, { type: 'u128' }),
      quantity: StellarSdk.nativeToScVal(item.quantity, { type: 'u32' }),
    }));

    const contract = new StellarSdk.Contract(contractId);
    const op = contract.call(
      'create_invoice',
      StellarSdk.Address.fromString(input.issuer).toScVal(),
      StellarSdk.Address.fromString(input.recipient).toScVal(),
      StellarSdk.nativeToScVal(items, { type: 'vector' }),
      StellarSdk.nativeToScVal(input.dueDate, { type: 'u64' }),
      input.notes
        ? StellarSdk.nativeToScVal(input.notes, { type: 'option' })
        : StellarSdk.nativeToScVal(null, { type: 'option' })
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.stellar.getNetworkPassphrase(),
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    tx.sign(sourceKeypair);
    const result = await this.stellar.sendTransaction(tx);
    return result.hash;
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const contractId = process.env.INVOICE_CONTRACT_ID!;
    const key = StellarSdk.nativeToScVal(invoiceId, { type: 'u64' });
    const result = await this.stellar.getContractData(contractId, key);
    return StellarSdk.scValToNative(result.xdr) as Invoice;
  }

  // Subscription Operations
  async createPlan(
    input: CreatePlanInput,
    sourceKeypair: StellarSdk.Keypair
  ): Promise<string> {
    const contractId = process.env.SUBSCRIPTION_CONTRACT_ID!;
    const account = await this.stellar.getAccount(sourceKeypair.publicKey());

    const contract = new StellarSdk.Contract(contractId);
    const op = contract.call(
      'create_plan',
      StellarSdk.Address.fromString(input.creator).toScVal(),
      StellarSdk.nativeToScVal(input.name, { type: 'string' }),
      StellarSdk.nativeToScVal(input.description, { type: 'string' }),
      StellarSdk.nativeToScVal(input.amount, { type: 'u128' }),
      StellarSdk.nativeToScVal(input.billingInterval, { type: 'string' }),
      StellarSdk.nativeToScVal(input.intervalCount, { type: 'u32' }),
      input.maxSubscribers
        ? StellarSdk.nativeToScVal(input.maxSubscribers, { type: 'option' })
        : StellarSdk.nativeToScVal(null, { type: 'option' })
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.stellar.getNetworkPassphrase(),
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    tx.sign(sourceKeypair);
    const result = await this.stellar.sendTransaction(tx);
    return result.hash;
  }

  async getPlan(planId: string): Promise<SubscriptionPlan> {
    const contractId = process.env.SUBSCRIPTION_CONTRACT_ID!;
    const key = StellarSdk.nativeToScVal(planId, { type: 'u64' });
    const result = await this.stellar.getContractData(contractId, key);
    return StellarSdk.scValToNative(result.xdr) as SubscriptionPlan;
  }

  async subscribe(
    input: SubscribeInput,
    sourceKeypair: StellarSdk.Keypair
  ): Promise<string> {
    const contractId = process.env.SUBSCRIPTION_CONTRACT_ID!;
    const account = await this.stellar.getAccount(sourceKeypair.publicKey());

    const contract = new StellarSdk.Contract(contractId);
    const op = contract.call(
      'subscribe',
      StellarSdk.nativeToScVal(input.planId, { type: 'u64' }),
      StellarSdk.Address.fromString(input.subscriber).toScVal()
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.stellar.getNetworkPassphrase(),
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    tx.sign(sourceKeypair);
    const result = await this.stellar.sendTransaction(tx);
    return result.hash;
  }

  async processBilling(
    subscriptionId: string,
    sourceKeypair: StellarSdk.Keypair
  ): Promise<string> {
    const contractId = process.env.SUBSCRIPTION_CONTRACT_ID!;
    const account = await this.stellar.getAccount(sourceKeypair.publicKey());

    const contract = new StellarSdk.Contract(contractId);
    const op = contract.call(
      'process_billing',
      StellarSdk.nativeToScVal(subscriptionId, { type: 'u64' })
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.stellar.getNetworkPassphrase(),
    })
      .addOperation(op)
      .setTimeout(300)
      .build();

    tx.sign(sourceKeypair);
    const result = await this.stellar.sendTransaction(tx);
    return result.hash;
  }
}

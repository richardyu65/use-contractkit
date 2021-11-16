import { CeloTx, EncodedTransaction, Signer } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import WalletConnect from '@walletconnect/client';
import { IClientMeta } from '@walletconnect/types';
import * as ethUtil from 'ethereumjs-util';

import { SupportedMethods } from './types';

/**
 * Implements the signer interface on top of the WalletConnect interface.
 */
export class WalletConnectSigner implements Signer {
  /**
   * Construct a new instance of a WalletConnectSigner
   */
  constructor(
    protected client: WalletConnect,
    protected session:
      | undefined
      | {
          connected: boolean;
          accounts: string[];
          chainId: number;
          bridge: string;
          key: string;
          clientId: string;
          clientMeta: IClientMeta | null;
          peerId: string;
          peerMeta: IClientMeta | null;
          handshakeId: number;
          handshakeTopic: string;
        },
    protected account: string
  ) {}

  signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  private request<T>(method: SupportedMethods, params: unknown[]): Promise<T> {
    return this.client
      .sendCustomRequest({
        method,
        params,
        jsonrpc: '2.0',
      })
      .then((_) => {
        console.log('request result', _);
        return _ as unknown;
      }) as Promise<T>;
  }

  async signRawTransaction(tx: CeloTx): Promise<EncodedTransaction> {
    const signedTx = await this.request<EncodedTransaction>(
      SupportedMethods.signTransaction,
      [tx]
    );
    return signedTx;
  }

  async signTypedData(
    data: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const rpcSig = await this.request<{ v: number; r: Buffer; s: Buffer }>(
      SupportedMethods.signTypedData,
      [data]
    );
    return rpcSig;
  }

  async signPersonalMessage(
    data: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const signature = await this.request<string>(
      SupportedMethods.personalSign,
      [data]
    );
    return ethUtil.fromRpcSig(signature) as { v: number; r: Buffer; s: Buffer };
  }

  getNativeKey = (): string => this.account;

  async decrypt(data: Buffer): Promise<Buffer> {
    const result = await this.request<string>(SupportedMethods.decrypt, [data]);
    return Buffer.from(result, 'hex');
  }

  async computeSharedSecret(publicKey: string): Promise<Buffer> {
    const result = await this.request<string>(
      SupportedMethods.computeSharedSecret,
      [publicKey]
    );
    return Buffer.from(result, 'hex');
  }
}

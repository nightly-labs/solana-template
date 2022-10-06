import {
  PublicKey as SolanaPublicKey,
  Transaction as SolanaTx,
  VersionedTransaction
} from '@solana/web3.js'

export interface WalletAdapter {
  publicKey: SolanaPublicKey
  connected: boolean
  signTransaction: (transaction: SolanaTx | VersionedTransaction) => Promise<VersionedTransaction>
  signAllTransactions: (
    transaction: SolanaTx[] | VersionedTransaction[]
  ) => Promise<VersionedTransaction[]>
  connect: () => any
  disconnect: () => any
}

export declare class Nightly {
  solana: SolanaNightly
  private readonly _nightlyEventsMap
  constructor()
  invalidate(): void
}

export declare class SolanaNightly {
  publicKey: SolanaPublicKey
  _onDisconnect: () => void
  private readonly _nightlyEventsMap
  constructor(eventMap: Map<string, (data: any) => any>)
  connect(onDisconnect?: () => void): Promise<SolanaPublicKey>
  disconnect(): Promise<void>
  signTransaction(tx: SolanaTx | VersionedTransaction): Promise<VersionedTransaction>
  signAllTransactions(txs: SolanaTx[] | VersionedTransaction[]): Promise<VersionedTransaction[]>
  signMessage(msg: string): Promise<Uint8Array>
}

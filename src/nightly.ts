import { PublicKey, Transaction } from '@solana/web3.js'
import { SolanaNightly, WalletAdapter } from './types'
const DEFAULT_PUBLICKEY = new PublicKey(0)

export class NightlyWalletAdapter implements WalletAdapter {
  _publicKey: PublicKey
  _connected: boolean
  constructor() {
    this._connected = false
    this._publicKey = DEFAULT_PUBLICKEY
  }

  get connected() {
    return this._connected
  }

  public async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this._provider) {
      return transactions
    }

    return await this._provider.signAllTransactions(transactions)
  }

  private get _provider(): SolanaNightly {
    if ((window as any)?.nightly.solana) {
      return (window as any).nightly.solana
    } else {
      throw new Error('SolanaNightly: solana is not defined')
    }
  }

  get publicKey() {
    return this._publicKey || DEFAULT_PUBLICKEY
  }

  async signTransaction(transaction: Transaction) {
    if (!this._provider) {
      return transaction
    }

    return await this._provider.signTransaction(transaction)
  }

  async signMessage(msg: string) {
    if (!this._provider) {
      return msg
    }

    return await this._provider.signMessage(msg)
  }

  async connect(onDisconnect?: () => void) {
    try {
      const pk = await this._provider.connect(onDisconnect)
      this._publicKey = pk
      this._connected = true
      return pk
    } catch (error) {
      console.log(error)
      throw new Error('User refused connection')
    }
  }

  async disconnect() {
    if (this._publicKey) {
      await this._provider.disconnect()
      this._publicKey = DEFAULT_PUBLICKEY
      this._connected = false
    }
  }
}

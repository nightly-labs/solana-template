import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction as SolanaTx
} from '@solana/web3.js'
import { useEffect, useState } from 'react'
import './App.css'
import { NightlyWalletAdapter } from './nightly'
import { NATIVE_MINT, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token'
import { Button, Typography } from '@material-ui/core'
import { NCSolanaWalletAdapter } from '@nightlylabs/connect-solana'

const NightlySolana = new NightlyWalletAdapter()
const connection = new Connection('https://api.devnet.solana.com')

const NightlyConnectSolana = new NCSolanaWalletAdapter({
  appMetadata: {
    additionalInfo: ' Test Additional info',
    application: 'Test application',
    description: 'Test description',
    icon: 'https://docs.nightly.app/img/logo.png'
  }
})
function App() {
  const [userPublicKey, setUserPublicKey] = useState<PublicKey | undefined>(undefined)
  useEffect(() => {
    NightlyConnectSolana.modal.onOpen = () => {
      console.log('modal opened with event handler')
    }
    NightlyConnectSolana.on('connect', setUserPublicKey)
    NightlyConnectSolana.on('error', error => {
      console.log(error)
    })
  }, [])

  return (
    <div className='App'>
      <header className='App-header'>
        <Typography>
          {userPublicKey ? `Hello, ${userPublicKey.toBase58()}` : 'Hello, stranger'}
        </Typography>

        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10 }}
          onClick={async () => {
            const value = await NightlySolana.connect(() => {
              console.log('Trigger disconnect Solana')
              setUserPublicKey(undefined)
            })
            setUserPublicKey(value)
            console.log(value.toString())
          }}>
          Connect Solana
        </Button>
        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10 }}
          onClick={async () => {
            await NightlyConnectSolana.connect()
          }}>
          Nightly Connect
        </Button>

        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!userPublicKey) return
            try {
              const wrappedSolAccount = Keypair.generate()

              const createIx = SystemProgram.createAccount({
                fromPubkey: userPublicKey,
                newAccountPubkey: wrappedSolAccount.publicKey,
                lamports: 10_000_000,
                space: 165,
                programId: TOKEN_PROGRAM_ID
              })

              const initIx = Token.createInitAccountInstruction(
                TOKEN_PROGRAM_ID,
                NATIVE_MINT,
                wrappedSolAccount.publicKey,
                userPublicKey
              )

              const approveIx = Token.createApproveInstruction(
                TOKEN_PROGRAM_ID,
                wrappedSolAccount.publicKey,
                new PublicKey('147oKbjwGDHEthw7sRKNrzYiRiGqYksk1ravTMFkpAnv'),
                userPublicKey,
                [],
                5000000
              )

              const tx = new SolanaTx()

              tx.add(createIx).add(initIx).add(approveIx)

              const a = await connection.getLatestBlockhash()

              tx.recentBlockhash = a.blockhash
              tx.feePayer = userPublicKey

              if (NightlyConnectSolana.connected) {
                const signedTx = await NightlyConnectSolana.signTransaction(tx)
                signedTx.partialSign(wrappedSolAccount)
                const id = await connection.sendRawTransaction(signedTx.serialize())
                console.log(id)
              } else {
                const signedTx = await NightlySolana.signTransaction(tx)
                signedTx.partialSign(wrappedSolAccount)
                const id = await connection.sendRawTransaction(signedTx.serialize())
                console.log(id)
              }
            } catch (err) {
              console.log(err)
            }
          }}>
          Approve 0.0005 SOL delegate and send 0.001 SOL
        </Button>
        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!userPublicKey) return

            const ix = SystemProgram.transfer({
              fromPubkey: userPublicKey,
              lamports: 5_000_000,
              toPubkey: new PublicKey('C3XueH9USYvEioWKvn3TkApiAf2TjYd7Gpqi83h6cNXg')
            })
            const tx = new SolanaTx().add(ix).add(ix).add(ix).add(ix).add(ix)
            const a = await connection.getRecentBlockhash()
            tx.recentBlockhash = a.blockhash
            tx.feePayer = userPublicKey
            if (NightlyConnectSolana.connected) {
              const signedTx = await NightlyConnectSolana.signTransaction(tx)
              const id = await connection.sendRawTransaction(signedTx.serialize())
              console.log(id)
            } else {
              const signedTx = await NightlySolana.signTransaction(tx)
              const id = await connection.sendRawTransaction(signedTx.serialize())
              console.log(id)
            }
          }}>
          Send test 0.0005 SOL
        </Button>
        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!userPublicKey) return

            const ix = SystemProgram.transfer({
              fromPubkey: userPublicKey,
              lamports: 1_000_000,
              toPubkey: new PublicKey('147oKbjwGDHEthw7sRKNrzYiRiGqYksk1ravTMFkpAnv')
            })
            const tx = new SolanaTx().add(ix).add(ix)
            const tx2 = new SolanaTx().add(ix).add(ix).add(ix).add(ix)
            const a = await connection.getRecentBlockhash()
            tx.recentBlockhash = a.blockhash
            tx.feePayer = userPublicKey
            tx2.recentBlockhash = a.blockhash
            tx2.feePayer = userPublicKey
            const signedTxs = await NightlySolana.signAllTransactions([tx, tx2])
            for (const signedTx of signedTxs) {
              const id = await connection.sendRawTransaction(signedTx.serialize())

              console.log(id)
            }
          }}>
          Sign all and send 0.0001 SOL
        </Button>
        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!userPublicKey) return
            const messageToSign =
              'I like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtlesI like turtles I like turtlesI like turtlesI like turtles'
            const signedMessage = await NightlySolana.signMessage(messageToSign)
            console.log(signedMessage)
          }}>
          Sign Message
        </Button>
        <Button
          variant='contained'
          color='secondary'
          style={{ margin: 10 }}
          onClick={async () => {
            try {
              await NightlySolana.disconnect()
              await NightlyConnectSolana.disconnect()
              setUserPublicKey(undefined)
            } catch (err) {
              console.log(err)
            }
          }}>
          Disconnect Solana
        </Button>
      </header>
    </div>
  )
}

export default App

import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { Connection, PublicKey, SystemProgram, Transaction as SolanaTx } from '@solana/web3.js'
import { useState } from 'react'
import './App.css'
import { NightlyWalletAdapter } from './nightly'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'

const NightlySolana = new NightlyWalletAdapter()
const connection = new Connection('https://api.devnet.solana.com')
function App() {
  const [userPublicKey, setUserPublicKey] = useState<PublicKey | undefined>(undefined)
  return (
    <div className='App'>
      <header className='App-header'>
        <Typography>
          {userPublicKey ? `Hello, ${userPublicKey.toBase58()}` : 'Hello, stranger'}
        </Typography>
        <Button
          variant='contained'
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
        </Button>{' '}
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!userPublicKey) return

            const approveIx = Token.createApproveInstruction(
              TOKEN_PROGRAM_ID,
              userPublicKey,
              new PublicKey('147oKbjwGDHEthw7sRKNrzYiRiGqYksk1ravTMFkpAnv'),
              userPublicKey,
              [],
              5_000_000
            )
            const ix = SystemProgram.transfer({
              fromPubkey: userPublicKey,
              lamports: 1_000_000,
              toPubkey: new PublicKey('147oKbjwGDHEthw7sRKNrzYiRiGqYksk1ravTMFkpAnv')
            })
            const tx = new SolanaTx().add(approveIx).add(ix)
            const a = await connection.getLatestBlockhash()
            tx.recentBlockhash = a.blockhash
            tx.feePayer = userPublicKey
            const signedTx = await NightlySolana.signTransaction(tx)
            const id = await connection.sendRawTransaction(signedTx.serialize())
            console.log(id)
          }}>
          Approve 0.0005 SOL delegate and send 0.0001 SOL
        </Button>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!userPublicKey) return

            const ix = SystemProgram.transfer({
              fromPubkey: userPublicKey,
              lamports: 1_000_000,
              toPubkey: new PublicKey('147oKbjwGDHEthw7sRKNrzYiRiGqYksk1ravTMFkpAnv')
            })
            const tx = new SolanaTx().add(ix).add(ix).add(ix).add(ix).add(ix)
            const a = await connection.getRecentBlockhash()
            tx.recentBlockhash = a.blockhash
            tx.feePayer = userPublicKey
            const signedTx = await NightlySolana.signTransaction(tx)
            const id = await connection.sendRawTransaction(signedTx.serialize())
            console.log(id)
          }}>
          Send test 0.0005 SOL
        </Button>
        <Button
          variant='contained'
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
          style={{ margin: 10 }}
          onClick={async () => {
            await NightlySolana.disconnect()
          }}>
          Disconnect Solana
        </Button>
      </header>
    </div>
  )
}

export default App

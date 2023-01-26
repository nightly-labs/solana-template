import {
  Connection,
  Keypair,
  Message,
  PublicKey,
  SystemProgram,
  Transaction as SolanaTx,
  Transaction,
  VersionedTransaction
} from '@solana/web3.js'
import { useEffect, useState } from 'react'
import './App.css'
import { NightlyWalletAdapter } from './nightly'
import { NATIVE_MINT, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token'
import { Button, Input, Typography } from '@material-ui/core'
import { NCSolanaWalletAdapter } from '@nightlylabs/connect-solana'
// @ts-expect-error
import docs from './docs.png'

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
  const [hasError, setHasError] = useState(false)
  const [hasTx, setHasTx] = useState(false)
  useEffect(() => {
    NightlyConnectSolana.modal.onOpen = () => {
      console.log('modal opened with event handler')
    }
    NightlyConnectSolana.on('connect', setUserPublicKey)
    NightlyConnectSolana.on('error', error => {
      console.log(error)
    })

    const query = window.location.search
    const params = new URLSearchParams(query)

    if (params.get('data') === null) {
      return
    }

    const data = JSON.parse(params.get('data') as string)

    if (data?.success !== true) {
      setHasError(true)
      return
    }

    if (typeof data?.signatures !== 'undefined') {
      setHasTx(true)
      return
    }

    if (typeof data?.signedTransactions === 'undefined') {
      return
    }

    const transaction = (JSON.parse(data.signedTransactions) as string[]).map(tx =>
      Buffer.from(tx, 'hex')
    )[0]
    connection
      .sendRawTransaction(transaction)
      .then(() => {
        setHasTx(true)
      })
      .catch(() => {
        setHasError(true)
      })
  }, [])

  const [inputPubkey, setInputPubkey] = useState('')

  return (
    <div className='App'>
      <header className='App-header'>
        <div>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              window.open('https://docs.nightly.app/docs/solana/solana/detecting')
            }}
            style={{ background: '#2680d9', marginBottom: '64px' }}>
            <img src={docs} style={{ width: '40px', height: '40px', paddingRight: '16px' }} />
            Open documentation
          </Button>
        </div>
        {hasError ? (
          <Typography style={{ color: 'red' }}>Transaction from deeplink was not sent</Typography>
        ) : null}
        {hasTx ? (
          <Typography style={{ color: 'green' }}>Transaction from deeplink was sent</Typography>
        ) : null}
        <Typography>
          {userPublicKey ? `Hello, ${userPublicKey.toBase58()}` : 'Hello, stranger'}
        </Typography>

        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10, background: '#2680d9' }}
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
          style={{ margin: 10, background: '#2680d9' }}
          onClick={async () => {
            await NightlyConnectSolana.connect()
          }}>
          Nightly Connect
        </Button>

        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10, background: '#2680d9' }}
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
                // @ts-expect-error
                signedTx.sign([wrappedSolAccount])
                const id = await connection.sendRawTransaction(signedTx.serialize())
                console.log(id)
              } else {
                const signedTx = await NightlySolana.signTransaction(tx)
                signedTx.sign([wrappedSolAccount])
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
          style={{ margin: 10, background: '#2680d9' }}
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
              console.log({ signedTx })
              const id = await connection.sendRawTransaction(signedTx.serialize())
              console.log(id)
            }
          }}>
          Send test 0.0005 SOL
        </Button>
        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10, background: '#2680d9' }}
          onClick={async () => {
            if (!userPublicKey) return

            const a = await connection.getRecentBlockhash()
            const versionedTx = new VersionedTransaction(
              new Message({
                header: {
                  numRequiredSignatures: 1,
                  numReadonlySignedAccounts: 0,
                  numReadonlyUnsignedAccounts: 0
                },
                recentBlockhash: a.blockhash,
                instructions: [],
                accountKeys: [userPublicKey.toBase58()]
              })
            )

            const signedTx = await NightlySolana.signTransaction(versionedTx)
            const id = await connection.sendRawTransaction(signedTx.serialize())
            console.log(id)
          }}>
          Send test versioned transaction
        </Button>
        <Button
          variant='contained'
          color='primary'
          style={{ margin: 10, background: '#2680d9' }}
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
          style={{ margin: 10, background: '#2680d9' }}
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
        <Input
          placeholder='Pubkey for deeplink transaction'
          value={inputPubkey}
          onChange={e => {
            setInputPubkey(e.currentTarget.value)
          }}
          style={{ margin: 10, backgroundColor: 'white', width: 300 }}
        />
        <Button
          variant='contained'
          color='secondary'
          style={{ margin: 10, backgroundColor: 'gold', color: 'black' }}
          onClick={async () => {
            const address = 'https://solana-template-ten.vercel.app'
            const a = await connection.getRecentBlockhash()
            const ix = SystemProgram.transfer({
              fromPubkey: new PublicKey(inputPubkey),
              lamports: 1_000_000,
              toPubkey: new PublicKey('147oKbjwGDHEthw7sRKNrzYiRiGqYksk1ravTMFkpAnv')
            })
            const tx = new SolanaTx().add(ix)
            tx.recentBlockhash = a.blockhash
            tx.feePayer = new PublicKey(inputPubkey)
            const txs = [
              Buffer.from(new VersionedTransaction(tx.compileMessage()).serialize()).toString('hex')
            ]
            window.location.assign(
              `https://wallet.nightly.app/direct/signTransactions?network=SOLANA&transactions=${JSON.stringify(
                txs
              )}&responseRoute=${encodeURIComponent(address)}&metadata=${JSON.stringify({
                name: 'Universal Links test',
                icon: 'https://icodrops.com/wp-content/uploads/2021/08/mangomarkets_logo-150x150.jpeg'
              })}`
            )
          }}>
          Send 0.001 SOL through Nightly Mobile deeplink
        </Button>
        <Button
          variant='contained'
          color='secondary'
          style={{ margin: 10, backgroundColor: 'gold', color: 'black' }}
          onClick={async () => {
            const address = 'https://solana-template-ten.vercel.app'
            const a = await connection.getRecentBlockhash()
            const ix = SystemProgram.transfer({
              fromPubkey: new PublicKey(inputPubkey),
              lamports: 1_000_000,
              toPubkey: new PublicKey('147oKbjwGDHEthw7sRKNrzYiRiGqYksk1ravTMFkpAnv')
            })
            const tx = new SolanaTx().add(ix)
            tx.recentBlockhash = a.blockhash
            tx.feePayer = new PublicKey(inputPubkey)
            const txs = [
              Buffer.from(new VersionedTransaction(tx.compileMessage()).serialize()).toString('hex')
            ]
            window.location.assign(
              `https://wallet.nightly.app/direct/signTransactions?network=SOLANA&transactions=${JSON.stringify(
                txs
              )}&responseRoute=${encodeURIComponent(
                address
              )}&sendFromApp=true&metadata=${JSON.stringify({
                name: 'Universal Links test',
                icon: 'https://icodrops.com/wp-content/uploads/2021/08/mangomarkets_logo-150x150.jpeg'
              })}`
            )
          }}>
          Send 0.001 SOL through Nightly Mobile deeplink immediately from app
        </Button>
      </header>
    </div>
  )
}

export default App

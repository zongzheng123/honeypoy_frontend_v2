import { ethers } from 'ethers'
import { Network, networks } from './chain'
import BigNumber from 'bignumber.js'
import { WalletClient, createWalletClient, http, parseEther } from 'viem'

export class Wallet {
  account: string = ''
  accountShort = ''
  networks: Network[] = networks
  balance: BigNumber = new BigNumber(0)
  walletClient!: WalletClient
  currentChainId!: number

  get currentChain() {
    return this.networks.find((network) => network.chainId === this.currentChainId)
  }


  // get routerV2Contract () {
  //   return new RouterV2Contract
  // }


  constructor(args: Partial<Wallet>) {
  }

  initWallet ({account, chainId }: {
    account: string,
    chainId: string,
  }) {
    this.walletClient = createWalletClient({ 
      batch: {
        multicall: {
          batchSize: 20, 
        },
      },
      // @ts-ignore
      account, 
      // @ts-ignore
      chain: chainsMap[chainId],
      transport: http()
    })
  }
}

export const wallet = new Wallet({})
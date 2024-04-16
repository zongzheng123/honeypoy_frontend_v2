// import scrollTokens from '~/static/tokens/scroll_tokens.json'
// import scrollSepoliaTokens from '~/static/tokens/scroll_alpha_tokens.json'
import { wallet } from './wallet'
import { Token } from './contract/token'
import { PairContract } from './contract/pair-contract'
import BigNumber from 'bignumber.js'
import { exec } from '~/lib/contract'
import { trpcClient } from '@/lib/trpc'
import { makeAutoObservable } from 'mobx'
import { ValueState } from './utils'

class Liquidity {
  pairs: PairContract[] = []
  pairsByToken: Record<string, PairContract> = {}
  tokensMap: Record<string, Token> = {}

  get tokens () {
    return Object.values(this.tokensMap)
  }

  fromToken: Token | null  =  null
  toToken: Token | null  =  null
  deadline = new ValueState<number>({
    value: 0
  })
  fromTokenAmount = new ValueState<number>({
    value:0
  })
  toTokenAmount = new ValueState<number>({
    value: 0
  })


  liquidityLoading = false

  currentRemovePair: PairContract | null  =  null


  get routerV2Contract() {
    return wallet.currentChain?.contracts.routerV2
  }

  get factoryContract() {
    return wallet.currentChain?.contracts.factory
  }

  constructor() {
    makeAutoObservable(this)
  }

  setCurrentRemovePair(pair: PairContract) {
    this.currentRemovePair = new PairContract(pair)
  }



  switchTokens() {
    const fromToken = this.fromToken
    this.fromToken = this.toToken
    this.toToken = fromToken
  }

  async addLiquidity(
    token0Amount: string,
    token1Amount: string
  ) {
    if (!this.fromToken || !this.toToken) {
        return
    }
    const token0AmountWithDec = new BigNumber(token0Amount)
      .multipliedBy(new BigNumber(10).pow(this.fromToken.decimals))
      .toFixed()
    const token1AmountWithDec = new BigNumber(token1Amount)
      .multipliedBy(new BigNumber(10).pow(this.toToken.decimals))
      .toFixed()
    await Promise.all([
      this.fromToken.approve(token0AmountWithDec, this.routerV2Contract?.address as string),
      this.toToken.approve(token1AmountWithDec, this.routerV2Contract?.address as string),
    ])
    const deadline = this.deadline || Math.floor(Date.now() / 1000) + 60 * 20 // 20 mins time
    const args: any [] = [
      this.fromToken.address,
      this.toToken.address,
      token0AmountWithDec,
      token1AmountWithDec,
      0,
      0,
      wallet.account,
      deadline,
    ]
    // @ts-ignore
    await this.routerV2Contract?.contract?.write.addLiquidity(args)
    await Promise.all([this.fromToken.getBalance(), this.toToken.getBalance()])
  }

  initPool (pairs: {
    address: string
    token0: {
      address: string
      name: string
      symbol: string
      decimals: number
    },
    token1: {
      address: string
      name: string
      symbol: string
      decimals: number
    }
  }[]) {
    this.pairs = pairs.map((pair) => {
      const token0 = new Token(pair.token0)
      const token1 = new Token(pair.token1)
      const pairContract = new PairContract({
        address: pair.address,
        token0,
        token1
      })
      this.tokensMap[token0.address] = token0
      this.tokensMap[token1.address] = token1
      this.pairsByToken[`${token0.address}-${token1.address}`] = pairContract
      return pairContract
    })
  }
  // async getPools() {
  //   try {
  //     this.liquidityLoading = true
  //     const pairsTokensMap = {}
  //     const poolsLength = await this.factoryContract.allPairsLength()
  //     const poolAddresses = await Promise.all(
  //       Array.from({ length: poolsLength }).map((i, index) => {
  //         return this.factoryContract.allPairs(index)
  //       })
  //     )
  //     this.pairs = (await Promise.all(poolAddresses.map(async (poolAddress) => {
  //       const pairContract = new PairContract({
  //         address: poolAddress,
  //       })
  //       return pairContract
  //     })))
  //     // .filter((pair) => pair.token.balance.gt(0))
  //     this.pairsByToken = (
  //       await Promise.all(
  //         this.pairs.map(async (pair) => {
  //           await pair.init()
  //           return pair
  //         })
  //       )
  //     ).reduce((acc, cur) => {
  //       pairsTokensMap[cur.token0.address] = cur.token0
  //       pairsTokensMap[cur.token1.address] = cur.token1
  //       return acc
  //     }, {})
  //     this.pairsTokens = Object.values(pairsTokensMap)
  //     console.log('this.pairsTokens', this.pairsTokens)
  //     swap.fromToken = this.pairs[0]?.token0 || new Token({})
  //     swap.toToken = this.pairs[0]?.token1 || new Token({})
  //   } catch (error) {
  //     console.error(error,'this.liquidityLoading')
  //   }
  //   this.liquidityLoading = false
  // }

  async getPairByTokens(token0Address: string, token1Address: string) {
     if (this.pairsByToken[`${token0Address}-${token1Address}`] || this.pairsByToken[`${token1Address}-${token0Address}`]) {
        const pairContract =  this.pairsByToken[`${token0Address}-${token1Address}`]
        return pairContract
     }
    const pair = await trpcClient.pair.getPairByTokens.query({token0Address, token1Address})
    if (pair) {
       const pairContract =  new PairContract({...pair})
       return pairContract
    }
  }

}

export const liquidity = new Liquidity()

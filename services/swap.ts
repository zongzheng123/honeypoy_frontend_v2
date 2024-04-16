// import scrollTokens from '~/static/tokens/scroll_tokens.json'
// import scrollSepoliaTokens from '~/static/tokens/scroll_alpha_tokens.json'
import { Token } from './contract/token'
import { PairContract } from './contract/pair-contract'
import BigNumber from 'bignumber.js'
import { wallet } from './wallet';
import { liquidity } from './liquidity'
import { exec } from '~/lib/contract'
import { makeAutoObservable, reaction } from 'mobx';
import { AsyncState } from './utils';

class Swap {
  fromToken: Token | null = null
  toToken: Token | null= null

  fromAmount: string = ''
  toAmount: string = ''
  slippage: number = 0
  deadline: number = 0

  currentPair = new AsyncState<PairContract | undefined>(async () => {
    if (this.fromToken && this.toToken) {
      return  liquidity.getPairByTokens(this.fromToken.address, this.toToken.address)
    }
  })

  get fromAmountDecimals() {
    return this.fromToken
      ? new BigNumber(this.fromAmount)
          .multipliedBy(new BigNumber(10).pow(this.fromToken.decimals))
          .toFixed()
      : undefined
  }

  get toAmountDecimals() {
    return this.toToken
      ? new BigNumber(this.toAmount).multipliedBy(
          new BigNumber(10).pow(this.toToken.decimals)
        )
      : undefined
  }


  get factoryContract() {
    return wallet.currentChain?.contracts.factory
  }

  get routerV2Contract() {
    return wallet.currentChain?.contracts.routerV2
  }

  constructor() {
    reaction(() => this.fromToken, () => {
      if (this.fromToken && this.toToken) {
        this.currentPair.call()
      }
    })
    makeAutoObservable(this)
  }

  switchTokens() {
    const fromToken = this.fromToken
    this.fromToken = this.toToken
    this.toToken = fromToken
  }

  setFromToken(token: Token) {
    this.fromToken = token
  }

  setToToken(token: Token) {
    this.toToken = token
  }


  async swapExactTokensForTokens() {
    if (!this.fromToken || !this.toToken || !swap.toAmountDecimals) {
       return
    }
    await this.fromToken.approve(
      this.fromAmountDecimals?.toString() as string,
      this.routerV2Contract?.address as string
    )
    const deadline =this.deadline ||  Math.floor(Date.now() / 1000) + 60 * 20 // 20 mins time
    const path = [this.fromToken.address, this.toToken.address]
    const args: any [] = [
      swap.fromAmountDecimals?.toString() as string,
      new BigNumber(swap.toAmountDecimals)
        .minus(new BigNumber(swap.toAmountDecimals).multipliedBy(this.slippage))
        .toString(),
      path,
      wallet.account,
      deadline,
    ]
    // @ts-ignore
    await this.routerV2Contract?.contract?.write.swapExactTokensForTokens(args)
    await Promise.all([this.currentPair.value?.init(), this.fromToken.getBalance(), this.toToken.getBalance()])
  }

  // async getPairs () {
  //   const pair = {}
  //   pair.address = await factoryContract.contract.allPairs().call()
  //   const balance = await this.balanceOf(pair.address)
  //     const userHasBalance = balance > 0
  //     if(userHasBalance) {

  //       const pairContract = new web3.eth.Contract(IUniswapV2Pair.abi, pair.address);
  //       const [token0Address, token1Address] = await Promise.all([
  //       pairContract.methods.token0().call(),
  //       pairContract.methods.token1().call()])

  //       const [token0, token1, {LPtoken0Balance, LPtoken1Balance}] = await Promise.all([
  //         this.getTokenData(token0Address),
  //         this.getTokenData(token1Address),
  //         this.getUserPoolBalance(pair.address)
  //       ])
  //       pair.token0 = token0
  //       pair.token0Balance = LPtoken0Balance / 10 ** token0.decimals
  //       pair.token1 = token1
  //       pair.token1Balance = LPtoken1Balance / 10 ** token1.decimals
  //       pair.poolName = pair.token0.symbol + "-" + pair.token1.symbol
  //   }
  //   return pair
  //  }
}

export const swap = new Swap()

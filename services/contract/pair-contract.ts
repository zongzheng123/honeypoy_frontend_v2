import { Token } from "./token";
import BigNumber from "bignumber.js";
import { swap } from "../swap";
import { Signer, ethers } from "ethers";
import { BaseContract } from ".";
import { Contract } from "ethcall";
import { wallet } from "../wallet";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { exec } from "~/lib/contract";
import { makeAutoObservable } from "mobx";
import { getContract } from "viem";

// const totalSupply = await pairContract.methods.totalSupply().call()
// const LPTokenBalance = await this.balanceOf(pairAddress)
// const LPtoken0Balance = reserve0 * LPTokenBalance / totalSupply
// const LPtoken1Balance = reserve1 * LPTokenBalance / totalSupply

export class PairContract implements BaseContract {
  address: string = "";
  name: string = "";
  abi: any[] = IUniswapV2Pair.abi;
  token!: Token;
  totalSupply: BigNumber = new BigNumber(0);

  reserves: any = null;
  token0: Token = new Token({}) // fixed
  token1: Token = new Token({})  // fixed
  midPrice0: BigNumber = new BigNumber(1);
  midPrice1: BigNumber = new BigNumber(1);
  isInit = false;

  get token0LpBalance() {
    return !new BigNumber(this.totalSupply || 0).eq(0)
      ? new BigNumber(this.reserves?.reserve0.toString() || 0)
          .multipliedBy(this.token.balance || 0)
          .div(this.totalSupply || 0)
      : new BigNumber(0);
  }

  get token1LpBalance() {
    return !new BigNumber(this.totalSupply || 0).eq(0)
      ? new BigNumber(this.reserves?.reserve1.toString() || 0)
          .multipliedBy(this.token.balance || 0)
          .div(this.totalSupply || 0)
      : new BigNumber(0);
  }
  get liquidityDisplay() {
    return `${this.token0LpBalance.toFixed(2)} ${
      this.token0.symbol
    } - ${this.token1LpBalance.toFixed(2)} ${this.token1.symbol}`;
  }

  get poolName() {
    return this.token0.symbol + "-" + this.token1.symbol;
  }

  get contract() {
    return wallet.currentChain?.publicClient
      ? getContract({
          // @ts-ignore
          address: this.address,
          abi: this.abi,
          client: {
            public: wallet.currentChain.publicClient,
            wallet: wallet.walletClient,
          },
        })
      : null;
  }

  get routerV2Contract() {
    return wallet.currentChain?.contracts?.routerV2;
  }

  constructor(args: Partial<PairContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  getFromAmount(toAmount: string) {
    return new BigNumber(toAmount).multipliedBy(this.midPrice0).toFixed(2);
  }
  getToAmount(fromAmount: string) {
    return new BigNumber(fromAmount).multipliedBy(this.midPrice1).toFixed(2);
  }

  async getReserves() {
    const reserves = await this.contract?.read.getReserves([]);
    this.reserves = reserves;
    if (this.reserves?.reverse0 && this.reserves.reserve1) {
      const [midPrice0, midPrice1] = await Promise.all([
        this.routerV2Contract?.contract?.read.getAmountOut([
          new BigNumber(1)
            .multipliedBy(new BigNumber(10).pow(this.token0.decimals))
            .toFixed(),
          this.reserves.reserve0,
          this.reserves.reserve1,
        ]),
        this.routerV2Contract?.contract?.read.getAmountOut([
          new BigNumber(1)
            .multipliedBy(new BigNumber(10).pow(this.token1.decimals))
            .toFixed(),
          this.reserves.reserve1,
          this.reserves.reserve0,
        ]),
      ]);
      this.midPrice0 = new BigNumber(midPrice0?.toString() || 0).div(
        new BigNumber(10).pow(this.token1.decimals)
      );
      this.midPrice1 = new BigNumber(midPrice1?.toString() || 0).div(
        new BigNumber(10).pow(this.token0.decimals)
      );
    }
  }

  async getTotalSupply() {
    const totalSupply = await this.contract?.read.totalSupply([]);
    this.totalSupply = new BigNumber(totalSupply?.toString() || 0);
  }

  async init() {
    await this.getReserves()
  }
  async removeLiquidity(percent: number) {
    const liquidity = this.token.balance
      .multipliedBy(percent)
      .div(100)
      .multipliedBy(new BigNumber(10).pow(this.token.decimals));
    if (liquidity.gt(0)) {
      await this.token.approve(
        liquidity.toFixed(0),
        this.routerV2Contract?.address as string
      );
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins time
      // @ts-ignore
      await this.routerV2Contract?.contract?.write.removeLiquidity([
        this.token0.address,
        this.token1.address,
        liquidity.toFixed(0),
        0,
        0,
        wallet.account,
        deadline,
      ]);
      await this.init();
    }
  }
}

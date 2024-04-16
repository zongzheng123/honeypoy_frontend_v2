import { exec } from '~/lib/contract';
import { BaseContract } from "."
import { wallet } from '../wallet';
import factoryABI from '~/static/abis/factory.json';
import { Signer, ethers } from "ethers";
import { Contract } from "ethcall";
import BigNumber from "bignumber.js";
import { makeAutoObservable } from 'mobx';
import { get } from 'http';
import { getContract } from 'viem';

export class FactoryContract implements BaseContract {
  address = ''
  name: string = ''
  abi: any[] = factoryABI
  constructor(args: Partial<FactoryContract>) {
    Object.assign(this, args)
    makeAutoObservable(this)
  }
  get contract () {
    return wallet.currentChain?.publicClient ? getContract({
      // @ts-ignore
      address: this.address,
      abi: this.abi,
      client: { public: wallet.currentChain.publicClient, wallet: wallet.walletClient }
    }) : null
  }


}



import routerV2ABI from '~/static/abis/routerv2.json';

import { BaseContract } from ".";

import { wallet } from '../wallet';
import { getContract } from 'viem';

export class RouterV2Contract implements BaseContract {
  address = ''
  name: string = ''
  abi: any[] = routerV2ABI
  get contract () {
    return wallet.currentChain?.publicClient ? getContract({
      // @ts-ignore
      address: this.address,
      abi: this.abi,
      client: wallet.walletClient
    }) : null
  }
  constructor(args: Partial<RouterV2Contract>) {
    Object.assign(this, args)
  }
}


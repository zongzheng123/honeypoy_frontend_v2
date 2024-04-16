import { Signer, ethers } from 'ethers'
import { Contract } from 'ethcall'

export interface BaseContract {
  address: string
  name: string
  abi: any[]
}


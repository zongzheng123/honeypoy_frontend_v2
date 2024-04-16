import DataLoader from "dataloader";
import { kv } from "@vercel/kv";
import { createPublicClient, getContract, http, fallback } from "viem";
import { polygonMumbai } from "viem/chains";
import factoryABI from "~/static/abis/factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import ERC20ABI from "~/static/abis/erc20.json";
import { ethers } from 'ethers';
import { createPublicClientByChain } from "../client";
import { polygonMumbaiChain } from "../chain";

// 2. Set up your client with desired chain & transport.
const client = createPublicClientByChain(polygonMumbaiChain);

const factoryContract = getContract({
  address: "0x333bB9e7Aa8E02017E92cBAe2A8D500be7c0B95F",
  abi: factoryABI,
  // 1a. Insert a single client
  client,
});

export const tokenLoader = new DataLoader<`0x${string}`, {
    address: `0x${string}`,
    name: string
    symbol: string
    decimals: string
}>(
  async (addresses) => {
    // await kv.del("tokens");
    const tokensMap = (await kv.get<Record<string, any>>("tokens")) || {};
    const res = await Promise.all(addresses.map(async (address) => {
        //@ts-ignore
        address = address.toLowerCase();
        let token = tokensMap?.[address];
        if (!token) {
          const tokenContract = getContract({ address, abi: ERC20ABI, client });
          const [name, symbol, decimals] = await Promise.all([
              tokenContract.read.name().catch(console.error),
              tokenContract.read.symbol().catch(console.error),
              tokenContract.read.decimals().catch(console.error),
          ]);
          // @ts-ignore
          token = { address, name, symbol, decimals: decimals.toString() };
        //   console.log('token', token)\
        if ((token.name  || token.symbol) && token.decimals !== undefined) {
            tokensMap[address] = token;
        }
  
        }
        return token;
      }))
    await kv.set("tokens", tokensMap);
    return res
  }
);

export const pairByTokensLoader = new DataLoader<string, any>(
  async (tokens) => {
    const pairsMap = ( await kv.get<Record<string, any>>("pairsByTokens")) || {}
    const pairs = await Promise.all(tokens.map(async (t) => {
        let pair = pairsMap?.[t];
        if (!pair) {
          const [token0Address, token1Address] = t.split("-");
          const pairAddress = await factoryContract.read.getPair([token0Address, token1Address]);
          if (pairAddress === ethers.constants.AddressZero) {
            return null;
          }
          // const pairContract = getContract({ address: pairAddress as `0x${string}`, abi: IUniswapV2Pair.abi, client });
          const [token0, token1] =  await tokenLoader.loadMany([
              token0Address as `0x${string}`,
              token1Address as `0x${string}`
          ])
          pair = {
              address: pairAddress,
              token0,
              token1
          }
          pairsMap[t] = pair;
        }
        return pair;
      }))
      await kv.set("pairsByTokens", pairsMap);
      return pairs
  }
);

// export const pairByIndexLoader = new DataLoader(async () => {
//     const pairs = await contract.read.allPairsLength();
// });

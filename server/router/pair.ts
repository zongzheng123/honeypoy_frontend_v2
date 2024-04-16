import factoryABI from "~/static/abis/factory.json";

import { publicProcedure, router } from "../trpc";
import z from "zod";
import { pairByTokensLoader, tokenLoader } from "@/lib/dataloader/pair";
import { getContract } from "viem";
import { createPublicClientByChain } from "@/lib/client";
import { polygonMumbai } from "wagmi/chains";
import { kv } from "@vercel/kv";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import PQueue from "p-queue";
import { polygonMumbaiChain } from "@/lib/chain";

const queue = new PQueue({ concurrency: 10 });

const client = createPublicClientByChain(polygonMumbaiChain);

const factoryContract = getContract({
  // @ts-ignore
  address: "0x333bB9e7Aa8E02017E92cBAe2A8D500be7c0B95F",
  abi: factoryABI,
  client,
});

export const pairRouter = router({
  getPairByIndex: publicProcedure
    .input(
      z.object({
        index: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { index } = input;
    }),
  getPairByTokens: publicProcedure
    .input(
      z.object({
        token0Address: z.string(),
        token1Address: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { token0Address, token1Address } = input;
      return pairByTokensLoader.load(`${token0Address}-${token1Address}`);
    }),
  getPairs: publicProcedure.query(async () => {
    const length = (
      (await factoryContract.read.allPairsLength()) as BigInt
    ).toString();
    const allPairs = (await kv.get<Record<string, any>>("allPairs")) || {};
    Array.from({ length: Number(length) }).forEach(async (_, index) => {
      await queue.add(async () => {
        const pair = allPairs?.[index];
        if (!pair) {
          try {
            const pairAddress = await factoryContract.read.allPairs([index]);
            const pairContract = getContract({
              address: pairAddress as `0x${string}`,
              abi: IUniswapV2Pair.abi,
              client,
            });
            const [token0, token1] = await Promise.all([
              pairContract.read.token0(),
              pairContract.read.token1(),
            ]);
            const tokens = await Promise.all([
              tokenLoader.load(token0 as `0x${string}`),
              tokenLoader.load(token1 as `0x${string}`),
            ]);
            const pair = {
              address: pairAddress,
              token0: tokens[0],
              token1: tokens[1],
            };
            allPairs[index] = pair;
          } catch (error) {
            console.error(error);
          }
        }
        return pair;
      });
    });
    await queue.onIdle();
    await kv.set("allPairs", allPairs);
    return allPairs;
  }),
});

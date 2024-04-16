import { createPublicClient, getContract, http, fallback } from "viem";
import { polygonMumbai,Chain } from 'viem/chains';

export const createPublicClientByChain = (chain: Chain) => createPublicClient({
    chain: chain,
    batch: {
      multicall: {
        batchSize: 30,
      }
    },
    transport: fallback(chain.rpcUrls.default.http.map(url => http(url)), {
      retryCount: 3,
    }),
  });
import { polygonMumbai } from 'viem/chains';
export  const polygonMumbaiChain =  {
    ...polygonMumbai,
rpcUrls: {
    default: {
        http: ['https://polygon-mumbai-pokt.nodies.app']
    }
}
}
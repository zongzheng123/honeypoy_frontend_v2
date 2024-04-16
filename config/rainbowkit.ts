import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {polygonMumbai, berachainTestnet} from 'wagmi/chains'
export const config = getDefaultConfig({
  appName: 'honeypotfinance',
  projectId: '1d1c8b5204bfbd57502685fc0934a57d',
  chains: [polygonMumbai, berachainTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
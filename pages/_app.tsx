import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from "@/components/layout";
import { NextLayoutPage } from "@/types/nextjs";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { NextUIProvider } from "@nextui-org/react";

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps,
}: AppProps & {
  Component: NextLayoutPage;
}) {
  const ComponentLayout = Component.Layout || Layout;
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NextUIProvider>
            <ComponentLayout>
              <Component {...pageProps} />
            </ComponentLayout>
          </NextUIProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

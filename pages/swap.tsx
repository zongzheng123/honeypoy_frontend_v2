import Image from "next/image";
import { NextLayoutPage } from "@/types/nextjs";
import { SwapSvg } from "@/components/svg/swap";
import { ExchangeSvg } from "@/components/svg/exchange";
import { TokenSelector } from "@/components/TokenSelector";
import { Button } from "@/components/button";
import { Card, CardBody } from "@nextui-org/react";
import { trpcClient } from "@/lib/trpc";
import { useEffect } from "react";
import { liquidity } from "@/services/liquidity";
import { swap } from "@/services/swap";
import { observer } from "mobx-react-lite";

const SwapItemLabel = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <div className="text-sub text-sm font-normal leading-3 tracking-[0.14px]">
        {label}
      </div>
      <div className="mt-[8px] text-white text-right  text-[21px] font-bold leading-6">
        {value}
      </div>
    </div>
  );
};

const SwapCard = observer(() => {
  return (
    <div className="flex-0 w-[570px] h-[365px] max-w-full ">
      <div>
        <div>
          <div className="flex w-[113px] h-[43px] justify-center items-center gap-[5.748px] [background:var(--Button-Gradient,linear-gradient(180deg,rgba(232,211,124,0.13)_33.67%,#FCD729_132.5%),#F7931A)] px-[14.369px] py-[7.184px] rounded-[21.553px] border-[0.718px] border-solid border-[rgba(247,147,26,0.37)]">
            <SwapSvg></SwapSvg>
            Swap
          </div>
        </div>
        <div></div>
      </div>
      <div className="mt-[24px] flex flex-col justify-center items-start gap-[23px] [background:var(--card-color,#271A0C)] p-[20px] rounded-[20px] border-2 border-solid border-[rgba(247,147,26,0.10)]">
        <div className="flex justify-between items-center w-full">
          <SwapItemLabel label="From" value="0.0"></SwapItemLabel>
          <div>
            <div className="flex items-center">
              <div className="text-sub text-[]">Balance:2.39</div>
              <div className=" text-[color:var(--Button-Gradient,#F7931A)] text-base font-bold leading-3 tracking-[0.16px] underline">
                Max
              </div>
            </div>
            <TokenSelector value={swap.fromToken} onSelect={(token) => {
              swap.setFromToken(token)
            }}></TokenSelector>
          </div>
        </div>
        <div className="flex w-full items-center gap-[5px]">
          <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
          <ExchangeSvg></ExchangeSvg>
          <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
        </div>
        <div className="flex justify-between  items-center w-full">
          <SwapItemLabel label="To" value="0.0"></SwapItemLabel>
          <div>
            <TokenSelector value={swap.toToken} onSelect={(token) => {
              swap.setToToken(token)
            }}></TokenSelector>
          </div>
        </div>
        <Button>Swap</Button>
      </div>
    </div>
  );
})

const Swap: NextLayoutPage = ({ pairs}) => {
  useEffect(() => {
     liquidity.initPool(pairs)
  }, [])
  return (
    <div className="flex justify-center gap-[44px] flex-wrap">
      <Image
        src="/images/swap_statics.png"
        width={654}
        height={365}
        alt=""
      ></Image>
      <SwapCard></SwapCard>
    </div>
  );
};

export const getStaticProps = async (context: any) => {
  // prefetch `post.byId`
  const pairsMap = await trpcClient.pair.getPairs.query();
  return {
    props: {
      pairs: Object.values(pairsMap),
    },
    revalidate: 5,
  };
};

export default Swap;

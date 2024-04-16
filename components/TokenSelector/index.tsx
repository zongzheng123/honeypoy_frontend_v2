import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
  useDisclosure,
} from "@nextui-org/react";
import { DropdownSvg } from "../svg/dropdown";
import { IoSearchOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { Token } from "@/services/contract/token";
import { observer } from "mobx-react-lite";
import { liquidity } from "@/services/liquidity";
type TokenSelectorProps = {
  onSelect: (token: Token) => void;
  value?: Token | null;
};

export const TokenSelector = observer(
  ({ onSelect, value }: TokenSelectorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
      <Popover
        isOpen={isOpen}
        onOpenChange={(isOpen) => {
          isOpen ? onOpen() : onClose();
        }}
        placement="bottom"
        classNames={{
          base: [
            // arrow color
            "before:bg-default-200",
          ],
          content: [
            "py-3 px-4 border border-default-200",
            "bg-gradient-to-br from-white to-default-300",
            "dark:from-default-100 dark:to-default-50",
          ],
        }}
      >
        <PopoverTrigger>
          <Button className="inline-flex w-[124px] h-10 justify-between items-center shrink-0 border [background:#3E2A0F] px-2.5 py-0 rounded-[30px] border-solid border-[rgba(247,147,26,0.10)]">
            {value?.displayName ? value.displayName : "Select Token"}
            <DropdownSvg></DropdownSvg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-[352px] flex-col items-center gap-4 border border-[color:var(--card-stroke,#F7931A)] [background:var(--card-color,#271A0C)] rounded-xl border-solid">
          {(titleProps) => (
            <div className="w-full">
              <Input
                placeholder="Search token by symbol or address"
                // className=" bg-transparent"
                classNames={{
                  inputWrapper: "bg-transparent",
                }}
                isClearable={true}
                // labelPlacement="outside"
                startContent={<IoSearchOutline></IoSearchOutline>}
                endContent={<IoClose></IoClose>}
              />
              <Divider className="my-4" />
              <div>
                <div></div>
                <div className="max-h-[300px] overflow-auto">
                  {liquidity.tokens?.map((token) => {
                    return (
                      <div
                        key={token.address}
                        onClick={() => {
                          onSelect(token);
                          onClose();
                        }}
                        className="py-[8px] px-[8px] rounded-[8px] flex justify-between items-center cursor-pointer hover:[background:rgba(255,255,255,0.04)]"
                      >
                        <div>
                          <div>{token.name}</div>
                          <div className="text-[rgba(255,255,255,0.50)] [font-kerning:none] [font-feature-settings:'calt'_off] [font-family:Inter] text-xs font-normal leading-[14px]">
                            {token.symbol}
                          </div>
                        </div>
                        <div>{token.balance.toFormat(6)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      // <Dropdown>
      //   <DropdownTrigger>
      //     <button
      //       type="button"
      //       className="inline-flex w-[124px] h-10 justify-between items-center shrink-0 border [background:#3E2A0F] px-2.5 py-0 rounded-[30px] border-solid border-[rgba(247,147,26,0.10)]"
      //     >
      //       <span></span>
      //       <DropdownSvg></DropdownSvg>
      //     </button>
      //   </DropdownTrigger>
      //   <DropdownMenu  className="flex w-[352px] flex-col items-center gap-4 border border-[color:var(--card-stroke,#F7931A)] [background:var(--card-color,#271A0C)] rounded-xl border-solid">
      //     <DropdownItem showDivider closeOnSelect={false} >
      //       <div className="bg-transparent">

      //       </div>
      //     </DropdownItem>
      //     <DropdownSection title="Most popular">
      //       <DropdownItem   closeOnSelect={true} key="new" description="Create a new file">
      //         New file
      //       </DropdownItem>
      //     </DropdownSection>
      //     <DropdownSection title="Tokens">
      //       <DropdownItem  closeOnSelect={true} key="new1" description="Create a new file">
      //         New file
      //       </DropdownItem>
      //     </DropdownSection>
      //   </DropdownMenu>
      // </Dropdown>
    );
  }
);

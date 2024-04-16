import { HtmlHTMLAttributes, useState } from "react";
import { Logo } from "../svg/logo";
import { WalletConnect } from "../walletconnect";
import clsx from "clsx";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import Link from "next/link";

export const Header = (props: HtmlHTMLAttributes<any>) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuList: {
    path: string;
    title: string;
  }[] = [
    {
      path: "/swap",
      title: "Swap",
    },
    {
      path: "/faucet",
      title: "Faucet",
    },
    {
      path: "/pools",
      title: "Pools",
    },
  ];

  return (
    // <div className={clsx("flex h-[63px] maxW-[1332px] justify-between items-center py-[10px]  sm:px-[53px] px-[8px]", props.className)} >
    //     <div className="flex items-center gap-[5.6px]">
    //         <Logo></Logo>
    //         <div className="text-brand w-[171px] h-8 [font-family:'Bebas_Neue'] text-[28.927px] font-normal leading-[normal]">Honeypot Finance</div>
    //     </div>
    //     <Nav></Nav>
    // </div>
    <Navbar onMenuOpenChange={setIsMenuOpen} className={clsx("h-[63px] bg-transparent", props.className)} style={{
      backdropFilter: "none"
    }}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden  text-[white]"
        />
        <NavbarBrand>
          <Logo />
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuList.map((m) => (
          <NavbarItem key={m.title} isActive={router.pathname === m.path}>
            <Link
              href={m.path}
              className={clsx(
                "flex items-center justify-center  px-5 py-2.5 text-base font-normal leading-[normal]",
                router.pathname === m.path
                  ? " [background:#271A0C] border-[color:var(--button-stroke,rgba(247,147,26,0.20))] border rounded-[100px] border-solid"
                  : "hover:opacity-60"
              )}
            >
              {m.title}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        {/* <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem> */}
     <WalletConnect></WalletConnect>
      </NavbarContent>
      <NavbarMenu>
        {menuList.map((m, index) => (
          <NavbarMenuItem key={m.title}>
            <Link className="w-full" href="#">
              {m.title}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

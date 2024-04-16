import { Footer } from "./footer";
import { Header } from "./header";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div >
      <Header></Header>
      <div className=" px-[12px] pt-[72px]">{children}</div>
      {/* <Footer></Footer> */}
    </div>
  );
};

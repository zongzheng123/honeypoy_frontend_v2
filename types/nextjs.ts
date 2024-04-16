import { AppProps } from "next/app";

export type NextLayoutPage = AppProps["Component"] & {
  Layout?: ({ children }: { children: React.ReactNode }) => JSX.Element;
};

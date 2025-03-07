"use client";
import { redirect } from "next/navigation";
import React from "react";
import { useActiveAccount } from "thirdweb/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const account = useActiveAccount();

  if (!account?.address) {
    redirect("/");
  }

  return <div>{children}</div>;
};

export default Layout;

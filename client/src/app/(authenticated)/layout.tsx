"use client";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const account = useActiveAccount();

  useEffect(() => {
    if (!account) {
      redirect("/");
    }
  });

  return <div>{children}</div>;
};

export default Layout;

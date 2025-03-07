import { isLoggedIn } from "@/actions/login";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }

  return <div>{children}</div>;
};

export default Layout;
